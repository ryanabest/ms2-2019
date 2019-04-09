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
    value_cols = ['C8I001','C8I002','C8I003','C8I004','C8I005','C8I006','C8I007','C8I008','C8I009','C8I010','C8I011','C8I012','C8I013']
    value_col_names = {
            'C8I001':      'Less than $10,000'
           ,'C8I002':      '$10,000-$14,999'
           ,'C8I003':      '$15,000-$19,999'
           ,'C8I004':      '$20,000-$24,999'
           ,'C8I005':      '$25,000-$29,999'
           ,'C8I006':      '$30,000-$34,999'
           ,'C8I007':      '$35,000-$39,999'
           ,'C8I008':      '$40,000-$49,999'
           ,'C8I009':      '$50,000-$79,999'
           ,'C8I010':      '$80,000-$99,999'
           ,'C8I011':      '$100,000-$149,999'
           ,'C8I012':      '$150,000-$199,999'
           ,'C8I013':      '$200,000 or more'
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
    dat_df = pd.read_csv('../../Raw/'+year+'/nhgis0008_ds104_'+year+'_tract.csv')

    # pprint(dat_df['GISJOIN'].describe())
    # pprint(dat_df.shape)

    #
    dat_df['Total Population'] = dat_df['C7L001']
    dat_df['Percent White'] = dat_df['C9D001'] / dat_df['Total Population']
    dat_df['Percent Non-White'] = 1 - dat_df['Percent White']
    dat_df['Percent Black'] = dat_df['C9D002'] / dat_df['Total Population']
    dat_df['Homeownership Rate'] = dat_df['C7W001'] / (dat_df['C7W001']+dat_df['C7W002'])
    dat_df['Median Home Value'] = dat_df['C8J001']
    dat_df['Median Home Value Denominator'] = dat_df['C8I001']+dat_df['C8I002']+dat_df['C8I003']+dat_df['C8I004']+dat_df['C8I005']+dat_df['C8I006']+dat_df['C8I007']+dat_df['C8I008']+dat_df['C8I009']+dat_df['C8I010']+dat_df['C8I011']+dat_df['C8I012']+dat_df['C8I013']
    dat_df['Median Home Value Est'] = dat_df.apply(est_median,axis=1) ## estimate based on distribution across discrete categories
    dat_df['Median Home Value 2010'] = dat_df['Median Home Value']*inflation[year]

    print(dat_df.shape)
    pprint(dat_df.loc[dat_df['Median Home Value 2010']==0,'Median Home Value Est'])
    # dat_df['hv_diff'] = dat_df['Median Home Value'] - dat_df['Median Home Value Est']
    # print(dat_df['hv_diff'].describe())
    pprint(dat_df.shape)
    dat_df = dat_df.loc[dat_df['Total Population']>0,:] ## Remove all tracts without any population
    dat_df =dat_df[['GISJOIN','Total Population','Percent Non-White','Percent White','Percent Black','Homeownership Rate','Median Home Value Denominator','Median Home Value','Median Home Value 2010']]
    pprint(dat_df.shape)
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

create_geoJSON('1980')
