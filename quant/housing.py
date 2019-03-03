import numpy as np
import pandas as pd
import json
from pprint import pprint

with open('data/gz_2010_36_140_00_500k.json') as f:
    tracts=json.load(f)



def load_df():
    df = pd.read_json('data/housing/censusHousing.json')
    df.columns = df.iloc[0] ## first row as column names
    df = df.drop(df.index[0]) ## drop column name row
    return df

housing = load_df()

### ADD % HOMEOWNERSHIP COLUMN ###
# The homeownership rate is computed by dividing the number of owner-occupied housing units by the number of occupied housing units or households
# https://www.census.gov/quickfacts/fact/note/US/HSG445217
housing['DP04_0046E'] = pd.to_numeric(housing['DP04_0046E']) ## Estimate!!HOUSING TENURE!!Occupied housing units!!Owner-occupied
housing['DP04_0002E'] = pd.to_numeric(housing['DP04_0002E']) ## Estimate!!HOUSING OCCUPANCY!!Total housing units!!Occupied housing units
housing['pct_homeownership'] = housing['DP04_0046E'] / housing['DP04_0002E']

# print(len(housing.loc[housing['pct_homeownership'].isnull()])) ## 52
# print(housing['pct_homeownership'].describe()) ## 2338 out of 2390 rows, 52 tracts have 0 occupied housing units, min 0 to max 1
homeownership = housing[['NAME','GEO_ID','state','county','tract','pct_homeownership','DP04_0002E','DP04_0046E']]

### ADD % HOMEOWNERSHIP TO TRACTS GEOJSON FILE ###
new_features = []

for tract in tracts['features']:
    this_tract = homeownership[(homeownership['tract']==tract['properties']['TRACT']) & (homeownership['county']==tract['properties']['COUNTY'])]
    if len(this_tract) == 1 and ~np.isnan(this_tract.iloc[0]['pct_homeownership']):
        # pprint(this_tract.iloc[0]['pct_homeownership'])
        tract['properties']['pctHomeownership'] = this_tract.iloc[0]['pct_homeownership']
        new_features.append(tract)

new_tracts = {"type":"FeatureCollection","features":new_features}
# pprint(type(new_tracts))
with open('data/housing/housingHomeownership.json','w') as f:
    json.dump(new_tracts,f)
