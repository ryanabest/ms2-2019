import numpy as np
import pandas as pd
import json
from pprint import pprint

with open('data/gz_2010_36_140_00_500k.json') as f:
    tracts=json.load(f)

def load_df(file_path):
    df = pd.read_json(file_path)
    df.columns = df.iloc[0] ## first row as column names
    df = df.drop(df.index[0]) ## drop column name row
    return df

housing = load_df('data/housing/censusHousing.json')
poverty_race = load_df('data/povertyrace/censusPovertyRace.json')

### ADD MEDIAN HOME VALUE FOR OWNED HOME ###
# https://www.census.gov/quickfacts/fact/note/US/HSG445217
housing['median_homevalue'] = pd.to_numeric(housing['DP04_0089E']) ## Estimate!!HOUSING TENURE!!Occupied housing units!!Owner-occupied
housing.loc[housing['median_homevalue']<0,'median_homevalue'] = None

### ADD % HOMEOWNERSHIP COLUMN ###
# The homeownership rate is computed by dividing the number of owner-occupied housing units by the number of occupied housing units or households
# https://www.census.gov/quickfacts/fact/note/US/HSG445217
housing['DP04_0046E'] = pd.to_numeric(housing['DP04_0046E']) ## Estimate!!HOUSING TENURE!!Occupied housing units!!Owner-occupied
housing['DP04_0002E'] = pd.to_numeric(housing['DP04_0002E']) ## Estimate!!HOUSING OCCUPANCY!!Total housing units!!Occupied housing units
housing['pct_homeownership'] = housing['DP04_0046E'] / housing['DP04_0002E']

### ADD % POVERTY COLUMN ###
poverty_race['pct_poverty'] = pd.to_numeric(poverty_race['DP03_0119PE'])
poverty_race.loc[poverty_race['pct_poverty']<0,'pct_poverty'] = None
poverty_race['pct_poverty'] = poverty_race['pct_poverty']/100

### ADD % NON-WHITE COLUMN ###
poverty_race['pct_nonwhite'] = pd.to_numeric(poverty_race['DP05_0037PE'])
poverty_race.loc[poverty_race['pct_nonwhite']<0,'pct_nonwhite'] = None
poverty_race['pct_nonwhite'] = poverty_race['pct_nonwhite']/100
poverty_race['pct_nonwhite'] = 1-poverty_race['pct_nonwhite']

## ADD MORTGAGE % COLUMN ###
housing['pct_mortgage'] = pd.to_numeric(housing['DP04_0091PE'])
housing.loc[housing['pct_mortgage']<0,'pct_mortgage'] = None
housing['pct_mortgage'] = housing['pct_mortgage']/100

homeownership = housing[['NAME','GEO_ID','state','county','tract','pct_homeownership','DP04_0002E','DP04_0046E','median_homevalue','DP04_0089E','pct_mortgage','DP04_0091PE']]

### ADD COLUMNS TO GEOJSON FILE ###
new_features = []

for tract in tracts['features']:
    homeownership_tract = homeownership[(homeownership['tract']==tract['properties']['TRACT']) & (homeownership['county']==tract['properties']['COUNTY'])]
    if len(homeownership_tract) == 1:
        if ~np.isnan(homeownership_tract.iloc[0]['pct_homeownership']):
            tract['properties']['pctHomeownership'] = homeownership_tract.iloc[0]['pct_homeownership']
        if ~np.isnan(homeownership_tract.iloc[0]['median_homevalue']):
            tract['properties']['medianHomevalue'] = homeownership_tract.iloc[0]['median_homevalue']
        if ~np.isnan(homeownership_tract.iloc[0]['pct_mortgage']):
            tract['properties']['pctMortgage'] = homeownership_tract.iloc[0]['pct_mortgage']
    povertyrace_tract = poverty_race[(poverty_race['tract']==tract['properties']['TRACT']) & (poverty_race['county']==tract['properties']['COUNTY'])]
    if len(povertyrace_tract) == 1:
        if ~np.isnan(povertyrace_tract.iloc[0]['pct_poverty']):
            tract['properties']['pctPoverty'] = povertyrace_tract.iloc[0]['pct_poverty']
        if ~np.isnan(povertyrace_tract.iloc[0]['pct_nonwhite']):
            tract['properties']['pctNonwhite'] = povertyrace_tract.iloc[0]['pct_nonwhite']

    if ((len(povertyrace_tract) == 1) | (len(homeownership_tract) == 1)):
        new_features.append(tract)


new_tracts = {"type":"FeatureCollection","features":new_features}
# pprint(type(new_tracts))
with open('data/allCensus.json','w') as f:
    json.dump(new_tracts,f)
