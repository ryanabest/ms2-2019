import json
import copy
from pprint import pprint
from shapely.geometry import box, Polygon

with open('data/HOLC/HOLC_All.geojson') as h:
    holc_zones=json.load(h)

with open('data/allCensus.json') as f:
    tracts=json.load(f)

def max_min(coord_list):
    lat = []
    lon = []
    for coord in coord_list:
        lat.append(coord[1])
        lon.append(coord[0])
    return [min(lat),min(lon),max(lat),max(lon)]

def match_HOLC(tract):
    if tract['geometry']['type'] == 'MultiPolygon':
        coords = []
        for t in tract['geometry']['coordinates']:
            for c in t[0]:
                coords.append(c)
    elif tract['geometry']['type'] == 'Polygon':
        coords = tract['geometry']['coordinates'][0]
    poly = Polygon(tupelify(coords))
    matches  = {"A":0,"B":0,"C":0,"D":0}
    holc_ids = {"A":[],"B":[],"C":[],"D":[]}
    boroughs = {"A":[],"B":[],"C":[],"D":[]}
    for holc in holc_zones['features']:
        holc_grade = holc['properties']['holc_grade']
        holc_id = holc['properties']['holc_id']
        borough = holc['properties']['borough']
        holc_poly = Polygon(tupelify(holc['geometry']['coordinates'][0][0]))
        if poly.intersects(holc_poly):
            # pprint(holc)
            if holc_grade != 'E':
                matches[holc_grade] += 1
                holc_ids[holc_grade].append(holc_id)
                boroughs[holc_grade].append(borough)
    # pprint(matches)
    if matches['A'] > 0:
        tract_a = copy.deepcopy(tract)
        tract_a['properties']['holcGrade'] = 'A'
        tract_a['properties']['holcIds'] = holc_ids['A']
        tract_a['properties']['holcBoroughs'] = boroughs['A']
        new_features.append(tract_a)
    if matches['B'] > 0:
        tract_b = copy.deepcopy(tract)
        tract_b['properties']['holcGrade'] = 'B'
        tract_b['properties']['holcIds'] = holc_ids['B']
        tract_b['properties']['holcBoroughs'] = boroughs['B']
        new_features.append(tract_b)
    if matches['C'] > 0:
        tract_c = copy.deepcopy(tract)
        tract_c['properties']['holcGrade'] = 'C'
        tract_c['properties']['holcIds'] = holc_ids['C']
        tract_c['properties']['holcBoroughs'] = boroughs['C']
        new_features.append(tract_c)
    if matches['D'] > 0:
        tract_d = copy.deepcopy(tract)
        tract_d['properties']['holcGrade'] = 'D'
        tract_d['properties']['holcIds'] = holc_ids['D']
        tract_d['properties']['holcBoroughs'] = boroughs['D']
        new_features.append(tract_d)

def tupelify(coord_list):
    tuples = []
    for coord in coord_list:
        tuples.append(tuple(coord))
    return tuples

ny_metro = []
# pprint(type(tracts['features']))
for tract in tracts['features']:
    if tract['properties']['COUNTY'] in ["005","047","061","081","085","119"]:
        ny_metro.append(tract)

new_features = []

for metro in ny_metro:
    match_HOLC(metro)

# match_HOLC(tracts['features'][800])
new_tracts = {"type":"FeatureCollection","features":new_features}
# pprint(type(new_tracts))
with open('data/censusHolcOverlap.json','w') as f:
    json.dump(new_tracts,f)
# match_HOLC(ny_metro[0])
# test_tupes = tupelify(holc_zones['features'][0]['geometry']['coordinates'][0][0])
# test_tupes_a = tupelify(holc_zones['features'][1]['geometry']['coordinates'][0][0])
# test_poly = Polygon(test_tupes)
# test_poly_a = Polygon(test_tupes_a)
# print(test_poly.crosses(test_poly_a))
