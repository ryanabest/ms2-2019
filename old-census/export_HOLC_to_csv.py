import json
import copy
from pprint import pprint
import numpy as np
import pandas as pd

with open('HOLC/HOLC_All_Years.geojson') as h:
    holc_json=json.load(h)
holc_zones = holc_json['features']

test_export = []
for zone in holc_zones:
    # pprint(type(zone['properties']['census_match_data'][0]))
    if len(zone['properties']['census_match_data']) > 0:
        for d in zone['properties']['census_match_data']:
            d['borough'] = zone['properties']['borough']
            d['holc_id'] = zone['properties']['holc_id']
            test_export.append(d)
df = pd.DataFrame(test_export)

df.to_csv('HOLC/CSV/HOLC_All_Years.csv')
# pprint(df.loc[(df['borough']=='LowerWestchesterCo') & (df['holc_id']=='C10'),:])
