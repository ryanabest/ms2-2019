import numpy as np
import pandas as pd
import json
from pprint import pprint

with open('data/gz_2010_36_140_00_500k.json') as f:
    tracts=json.load(f)



def load_df():
    df = pd.read_json('data/povertyrace/censusPovertyRace.json')
    df.columns = df.iloc[0] ## first row as column names
    df = df.drop(df.index[0]) ## drop column name row
    return df

poverty_race = load_df()

poverty_race['pct_poverty'] = pd.to_numeric(poverty_race['DP03_0119PE'])
poverty_race.loc[poverty_race['pct_poverty']<0,:] = None
poverty_race['pct_poverty'] = poverty_race['pct_poverty']/100

'''
pprint(poverty_race['pct_poverty'].describe())
count    2333.000000
mean        0.146908
std         0.123537
min         0.000000
25%         0.052000
50%         0.113000
75%         0.215000
max         1.000000
'''

poverty_race['pct_nonwhite'] = pd.to_numeric(poverty_race['DP05_0037PE'])
poverty_race.loc[poverty_race['pct_nonwhite']<0,:] = None
poverty_race['pct_nonwhite'] = poverty_race['pct_nonwhite']/100
poverty_race['pct_nonwhite'] = 1-poverty_race['pct_nonwhite']

'''
pprint(poverty_race['pct_nonwhite'])
count    2333.000000
mean        0.550815
std         0.298486
min         0.000000
25%         0.271000
50%         0.559000
75%         0.838000
max         1.000000
'''

poverty = poverty_race[['NAME','GEO_ID','state','county','tract','pct_poverty','DP03_0119PE']]
nonwhite = poverty_race[['NAME','GEO_ID','state','county','tract','pct_nonwhite','DP05_0037PE']]


### ADD % POVERTY RATE TO TRACTS GEOJSON FILE ###
poverty_features = []

for tract in tracts['features']:
    this_tract = poverty[(poverty['tract']==tract['properties']['TRACT']) & (poverty['county']==tract['properties']['COUNTY'])]
    # pprint(len(this_tract))
    if len(this_tract) == 1 and ~np.isnan(this_tract.iloc[0]['pct_poverty']):
        # pprint(this_tract.iloc[0]['pct_homeownership'])
        tract['properties']['pctPoverty'] = this_tract.iloc[0]['pct_poverty']
        poverty_features.append(tract)

new_tracts = {"type":"FeatureCollection","features":poverty_features}
# pprint(type(new_tracts))
with open('data/povertyrace/censusPoverty.json','w') as f:
    json.dump(new_tracts,f)


nonwhite_features = []

for tract in tracts['features']:
    this_tract = nonwhite[(nonwhite['tract']==tract['properties']['TRACT']) & (nonwhite['county']==tract['properties']['COUNTY'])]
    # pprint(len(this_tract))
    if len(this_tract) == 1 and ~np.isnan(this_tract.iloc[0]['pct_nonwhite']):
        # pprint(this_tract.iloc[0]['pct_homeownership'])
        tract['properties']['pctNonwhite'] = this_tract.iloc[0]['pct_nonwhite']
        poverty_features.append(tract)

new_tracts = {"type":"FeatureCollection","features":poverty_features}
# pprint(type(new_tracts))
with open('data/povertyrace/censusNonwhite.json','w') as f:
    json.dump(new_tracts,f)
