import json
import os
from pprint import pprint
import numpy as np
import pandas as pd
import re

## SOURCE: http://www.in2013dollars.com/1930-dollars-in-2010?amount=1
inflation = {
     "1930":13.06
    ,"1940":15.58
    ,"1950":9.05
    ,"1960":7.37
    ,"1970":5.62
    ,"1980":2.65
    ,"1990":1.67
    ,"2000":1.27
    ,"2010":1
}


def est_median(row):
    running_total = 0

    total_col = 'BMY001'
    value_cols = ['BMZ001','BMZ002','BMZ003','BMZ004','BMZ005','BMZ006','BMZ007','BMZ008','BMZ009','BMZ010','BMZ011']
    value_col_names = {
         'BMZ001':      'Less than $1000'
        ,'BMZ002':      '$1000 to $1499'
        ,'BMZ003':      '$1500 to $1999'
        ,'BMZ004':      '$2000 to $2999'
        ,'BMZ005':      '$3000 to $4999'
        ,'BMZ006':      '$5000 to $7499'
        ,'BMZ007':      '$7500 to $9999'
        ,'BMZ008':      '$10000 to $14999'
        ,'BMZ009':      '$15000 to $19999'
        ,'BMZ010':      '$20000 and over'
        ,'BMZ011':      'Unknown'
    }

    for col in value_cols:
        running_total += row[col]
        if running_total >= row[total_col] / 2:
            range = list(map(int,re.findall(r"(\d+)",value_col_names[col])))
            return sum(range)/len(range)
            break


def create_geoJSON(year):
    with open('NY_tract_'+year+'.json') as j:
        gis_tracts=json.load(j)

    tracts = []
    props = []

    for tract in gis_tracts['features']:
        if tract['properties']['NHGISST'] == '360':
            tracts.append(tract)
            props.append(tract['properties'])

    gis_df = pd.DataFrame(props)
    dat_df = pd.read_csv('../../Raw/'+year+'/nhgis0004_ds63_'+year+'_tract.csv')
    pprint(gis_df.shape)
    dat_df = dat_df.loc[dat_df['STATEA']==36,:]
    # dat_df['TotalPopCheck'] =  dat_df['BM4001'] + dat_df['BM4002'] + dat_df['BM4003'] + dat_df['BM4004'] + dat_df['BM4005']
    # dat_df['GoodPop'] = dat_df['TotalPopCheck']-dat_df['BLW001']
    # pprint(dat_df['GoodPop'].describe())

    dat_df['Percent Non-White'] = (dat_df['BM4004']+dat_df['BM4005']) / dat_df['BLW001']
    dat_df['Percent White'] = 1 - dat_df['Percent Non-White']
    dat_df['Percent Black'] = dat_df['BM4004'] / dat_df['BLW001']
    dat_df['Homeownership Rate'] = dat_df['BMY001'] / dat_df['BMX001']
    dat_df['Median Home Value'] = dat_df.apply(est_median,axis=1)
    dat_df['Median Home Value 2010'] = dat_df['Median Home Value']*inflation[year]

    pprint(dat_df['Median Home Value 2010'].describe())



    pprint(dat_df.shape)
    dat_df = dat_df.loc[dat_df['Homeownership Rate'].notnull()]
    pprint(dat_df.shape)
    #
    # prop_df = gis_df.merge(dat_df,how='inner',on='GISJOIN')
    # prop_df = prop_df.drop(columns = ['PRETRACTA','POSTTRCTA'])
    #
    # features = []
    #
    # for tract in tracts:
    #     if len(prop_df.loc[prop_df['GISJOIN'] == tract['properties']['GISJOIN']]) > 0:
    #         properties = prop_df.loc[prop_df['GISJOIN'] == tract['properties']['GISJOIN']].to_dict('records')[0]
    #     # else:
    #     #     properties = tract['properties']
    #
    #         feature = {
    #              'geometry':tract['geometry']
    #             ,'properties':properties
    #             ,'type':'Feature'
    #         }
    #         features.append(feature)
    #
    # geoJSON_export = {"type":"FeatureCollection","features":features}
    # # pprint(type(geoJSON_export))
    # with open('IPUMS/'+year+'/'+year+'.json','w') as f:
    #     json.dump(geoJSON_export,f)

create_geoJSON('1930')



# pprint(prop_df.loc[prop_df['GISJOIN']=='G3600610008100',['Total Population','Total Dwelling Units','Owner Occuped Dwelling Units']])
