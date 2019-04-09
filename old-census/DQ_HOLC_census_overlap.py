import json
from pprint import pprint
from shapely.geometry import Polygon
import numpy as np
import time
import datetime

with open('HOLC/HOLC_All.geojson') as h:
    holc_json=json.load(h)
holc_zones = holc_json['features']
for holc_zone in holc_zones:
    holc_zone['properties']['census_match_data']=[]

def tupelify(coord_list):
    tuples = []
    for coord in coord_list:
        tuples.append(tuple(coord))
    return tuples

def weighted_average(matches,year):
    pct_holc_coverage = 0
    for match in matches:
        pct_holc_coverage += match['pct_match']
    stats = {'pct_holc_coverage':pct_holc_coverage,'metric_coverage_pct':{}}
    metrics = ['pct_nonwhite','pct_white','pct_black','pct_homeownership','median_home_value','median_home_value_2010','total_population']

    for metric in metrics:
        metric_value = 0
        metric_coverage = 0
        for match in matches:
            if ~np.isnan(match[metric]):
                metric_coverage += match['pct_match']
        stats['metric_coverage_pct'][metric] = metric_coverage
        for match in matches:
            if ~np.isnan(match[metric]):
                weight = match['pct_match']/metric_coverage
                metric_value += match[metric] * weight
        stats[metric]=metric_value

    stats['year'] = year
    # pprint(stats)

    return stats

def match_HOLC(holc_zone,year,i):

    # pprint(holc_zone)

    with open('IPUMS/Data/'+year+'/'+year+'.json') as f:
        tracts=json.load(f)
    tracts = tracts['features']

    holc_ID = holc_zone['properties']['borough'] + '_' + holc_zone['properties']['holc_id']


    holc_poly = Polygon(tupelify(holc_zone['geometry']['coordinates'][0][0]))
    census_matches = []
    for tract in tracts:
        if len(tract['geometry']['coordinates'][0]) >= 3:
            cens_poly = Polygon(tupelify(tract['geometry']['coordinates'][0]))
            if holc_poly.intersects(cens_poly):
                percent_overlap = holc_poly.intersection(cens_poly).area / holc_poly.area
                census_matches.append({
                     'pct_match':percent_overlap
                    ,'pct_nonwhite':tract['properties']['Percent Non-White']
                    ,'pct_white':tract['properties']['Percent White']
                    ,'pct_black':tract['properties']['Percent Black']
                    ,'pct_homeownership':tract['properties']['Homeownership Rate']
                    ,'median_home_value':tract['properties']['Median Home Value']
                    ,'median_home_value_2010':tract['properties']['Median Home Value 2010']
                    ,'total_population':tract['properties']['Total Population']
                    ,'GISJOIN': tract['properties']['GISJOIN']
                })
    #
    pprint(census_matches)
    # if holc_zone['properties']['borough'] == 'Brooklyn' and holc_zone['properties']['holc_id'] == 'D22':
    #     weighted_average(census_matches,year)
    if len(census_matches)>0:
        # pprint(census_matches)
        stats = weighted_average(census_matches,year)
        pprint(stats)
        holc_zone['properties']['census_match_data'].append(stats)

for (i,holc_zone) in enumerate(holc_zones):
    if (holc_zone['properties']['borough'] == 'Bronx' and holc_zone['properties']['holc_id'] == 'A1'):
        match_HOLC(holc_zone,'2000',i)
    # match_HOLC(holc_zone,'1940',i)
    # match_HOLC(holc_zone,'1950',i)
    # match_HOLC(holc_zone,'1960',i)
    # match_HOLC(holc_zone,'1970',i)
    # match_HOLC(holc_zone,'1980',i)
    # match_HOLC(holc_zone,'1990',i)
    # match_HOLC(holc_zone,'2000',i)
    # match_HOLC(holc_zone,'2010',i)


#
# geoJSON_export = {"type":"FeatureCollection","features":holc_zones}
# with open('HOLC/HOLC_All_Years.geojson','w') as f:
#     json.dump(geoJSON_export,f)
