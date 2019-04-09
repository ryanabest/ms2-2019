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

    total_col = 'Median Home Value Denominator'
    value_cols = ['B78001','B78002','B78003','B78004','B78005','B78006']
    value_col_names = {
          'B78001':      'Under $5,000'
         ,'B78002':      '$5,000 - $9,999'
         ,'B78003':      '$10,000 - $14,999'
         ,'B78004':      '$15,000 - $19,999'
         ,'B78005':      '$20,000 - $24,999'
         ,'B78006':      '$25,000 or more'
    }

    if row[total_col] == 0:
        return np.nan

    for col in value_cols:
        running_total += row[col]
        if running_total >= row[total_col] / 2:
            range = list(map(int,re.findall(r"(\d+)",value_col_names[col].replace(",",""))))
            if value_cols[0] == col:
                range.append(0)
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
    dat_df = pd.read_csv('../../Raw/'+year+'/nhgis0006_ds92_'+year+'_tract.csv')
    pprint(gis_df.shape)
    dat_df = dat_df.loc[dat_df['STATEA']==36,:]
    # dat_df['TotalPopCheck'] =  dat_df['BM4001'] + dat_df['BM4002'] + dat_df['BM4003'] + dat_df['BM4004'] + dat_df['BM4005']
    # dat_df['GoodPop'] = dat_df['TotalPopCheck']-dat_df['BLW001']
    # pprint(dat_df['GoodPop'].describe())

    pprint(dat_df.shape)
    dat_df = dat_df.loc[dat_df['CA5001']>0,:] ## Non-zero total occupied housing units
    dat_df = dat_df.loc[dat_df['CA4001']>0,:] ## Non-zero total population

    dat_df['Total Population'] = dat_df['CA4001']
    dat_df['Percent Non-White'] = dat_df['B9T001'] / dat_df['CA4001']
    dat_df['Percent White'] = 1 - dat_df['Percent Non-White']
    dat_df['Percent Black'] = dat_df['B7B002'] / (dat_df['B7B001']+dat_df['B7B002']+dat_df['B7B003'])
    dat_df['Homeownership Rate'] = dat_df['B9O001'] / (dat_df['B9O001'] + dat_df['B9O002']) ## owner occupied over owner + renter occupied
    # dat_df['Median Home Value'] = dat_df['B09001']
    dat_df['Median Home Value Denominator'] = dat_df['B78001']+dat_df['B78002']+dat_df['B78003']+dat_df['B78004']+dat_df['B78005']+dat_df['B78006']
    dat_df['Median Home Value'] = dat_df.apply(est_median,axis=1) ## estimate based on distribution across discrete categories
    dat_df['Median Home Value 2010'] = dat_df['Median Home Value']*inflation[year]

    pprint(dat_df.shape)
    dat_df = dat_df.loc[dat_df['Total Population']>0,:] ## Remove all tracts without any population
    dat_df =dat_df[['GISJOIN','Total Population','Percent Non-White','Percent White','Percent Black','Homeownership Rate','Median Home Value Denominator','Median Home Value','Median Home Value 2010']]
    pprint(dat_df.shape)

    # pprint(dat_df.loc[dat_df['GISJOIN']=='G36008101047',['B78001','B78002','B78003','B78004','B78005','B78006','CA6001','Median Home Value','Median Home Value 2010']])

    prop_df = gis_df.merge(dat_df,how='inner',on='GISJOIN')

    features = []

    for tract in tracts:
        if len(prop_df.loc[prop_df['GISJOIN'] == tract['properties']['GISJOIN']]) > 0:
            properties = prop_df.loc[prop_df['GISJOIN'] == tract['properties']['GISJOIN']].to_dict('records')[0]
        # else:
        #     properties = tract['properties']

            feature = {
                 'geometry':tract['geometry']
                ,'properties':properties
                ,'type':'Feature'
            }
            features.append(feature)

    geoJSON_export = {"type":"FeatureCollection","features":features}
    # pprint(type(geoJSON_export))
    with open(year+'.json','w') as f:
        json.dump(geoJSON_export,f)

create_geoJSON('1960')
