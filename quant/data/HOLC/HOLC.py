import json
from pprint import pprint

with open('HOLC_Bronx.geojson') as f:
    Bronx=json.load(f)

with open('HOLC_Brooklyn.geojson') as f:
    Brooklyn=json.load(f)

with open('HOLC_LowerWestchesterCo.geojson') as f:
    West=json.load(f)

with open('HOLC_Manhattan.geojson') as f:
    Manhattan=json.load(f)

with open('HOLC_Queens.geojson') as f:
    Queens=json.load(f)

with open('HOLC_StatenIsland.geojson') as f:
    StatenIsland=json.load(f)

new_features = []

for bx in Bronx['features']:
    bx['properties']['borough'] = 'Bronx'
    new_features.append(bx)

for bk in Brooklyn['features']:
    bk['properties']['borough'] = 'Brooklyn'
    new_features.append(bk)

for ws in West['features']:
    ws['properties']['borough'] = 'LowerWestchesterCo'
    new_features.append(ws)

for mh in Manhattan['features']:
    mh['properties']['borough'] = 'Manhattan'
    new_features.append(mh)

for qn in Queens['features']:
    qn['properties']['borough'] = 'Queens'
    new_features.append(qn)

for si in StatenIsland['features']:
    si['properties']['borough'] = 'StatenIsland'
    new_features.append(si)

all_holc = {"type":"FeatureCollection","features":new_features}
with open('HOLC_All.geojson','w') as f:
    json.dump(all_holc,f)
