import json
# import copy
# from pprint import pprint
import numpy as np
import pandas as pd


def process(year):
    with open('IPUMS/Data/'+str(year)+'/'+str(year)+'.json') as h:
        census_json=json.load(h)
    census = census_json['features']
    tracts = []
    for tract in census:
        tracts.append(tract['properties'])
    df = pd.DataFrame(tracts)
    df.to_csv('IPUMS/Data/'+str(year)+'/'+str(year)+'.csv')

for i in range(0,8):
    year = 1940 + (i*10)
    process(year)

# test_export = []
# for zone in holc_zones:
#     # pprint(type(zone['properties']['census_match_data'][0]))
#     if len(zone['properties']['census_match_data']) > 0:
#         for d in zone['properties']['census_match_data']:
#             d['borough'] = zone['properties']['borough']
#             d['holc_id'] = zone['properties']['holc_id']
#             test_export.append(d)
# df = pd.DataFrame(test_export)
#
# df.to_csv('HOLC/CSV/HOLC_All_Years.csv')
# # pprint(df.loc[(df['borough']=='LowerWestchesterCo') & (df['holc_id']=='C10'),:])
