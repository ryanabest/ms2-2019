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
    value_cols = ['ESR001','ESR002','ESR003','ESR004','ESR005','ESR006','ESR007','ESR008','ESR009','ESR010','ESR011','ESR012','ESR013','ESR014','ESR015','ESR016','ESR017','ESR018','ESR019','ESR020'
    ]
    value_col_names = {
             'ESR001':      'Less than $15,000'
            ,'ESR002':      '$15,000 to $19,999'
            ,'ESR003':      '$20,000 to $24,999'
            ,'ESR004':      '$25,000 to $29,999'
            ,'ESR005':      '$30,000 to $34,999'
            ,'ESR006':      '$35,000 to $39,999'
            ,'ESR007':      '$40,000 to $44,999'
            ,'ESR008':      '$45,000 to $49,999'
            ,'ESR009':      '$50,000 to $59,999'
            ,'ESR010':      '$60,000 to $74,999'
            ,'ESR011':      '$75,000 to $99,999'
            ,'ESR012':      '$100,000 to $124,999'
            ,'ESR013':      '$125,000 to $149,999'
            ,'ESR014':      '$150,000 to $174,999'
            ,'ESR015':      '$175,000 to $199,999'
            ,'ESR016':      '$200,000 to $249,999'
            ,'ESR017':      '$250,000 to $299,999'
            ,'ESR018':      '$300,000 to $399,999'
            ,'ESR019':      '$400,000 to $499,999'
            ,'ESR020':      '$500,000 or more'
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
    dat_df = pd.read_csv('../../Raw/'+year+'/nhgis0009_ds120_'+year+'_tract.csv')

    # pprint(dat_df.shape)

    #
    dat_df['Total Population'] = dat_df['ET1001']
    dat_df['Percent White'] = dat_df['EUY001'] / dat_df['Total Population']
    dat_df['Percent Non-White'] = 1 - dat_df['Percent White']
    dat_df['Percent Black'] = dat_df['EUY002'] / dat_df['Total Population']
    dat_df['Homeownership Rate'] = dat_df['ES1001'] / (dat_df['ES1001']+dat_df['ES1002'])
    dat_df['Median Home Value'] = dat_df['EST001']
    dat_df['Median Home Value Denominator'] = dat_df['ESR001']+dat_df['ESR002']+dat_df['ESR003']+dat_df['ESR004']+dat_df['ESR005']+dat_df['ESR006']+dat_df['ESR007']+dat_df['ESR008']+dat_df['ESR009']+dat_df['ESR010']+dat_df['ESR011']+dat_df['ESR012']+dat_df['ESR013']+dat_df['ESR014']+dat_df['ESR015']+dat_df['ESR016']+dat_df['ESR017']+dat_df['ESR018']+dat_df['ESR019']+dat_df['ESR020']
    dat_df['Median Home Value Est'] = dat_df.apply(est_median,axis=1) ## estimate based on distribution across discrete categories
    dat_df.loc[dat_df['Median Home Value'] == 0,['Median Home Value']] = np.nan
    dat_df['Median Home Value 2010'] = dat_df['Median Home Value']*inflation[year]
    dat_df['hv_diff'] = dat_df['Median Home Value'] - dat_df['Median Home Value Est']
    # print(dat_df['hv_diff'].describe())
    # pprint(dat_df[['Percent White','Percent Non-White','Percent Black','Homeownership Rate','Median Home Value','Median Home Value 2010']].head())

    # pprint(dat_df['Median Home Value 2010'].describe())

    pprint(dat_df.shape)
    dat_df = dat_df.loc[dat_df['Total Population']>0,:] ## Remove all tracts without any population
    dat_df =dat_df[['GISJOIN','Total Population','Percent Non-White','Percent White','Percent Black','Homeownership Rate','Median Home Value Denominator','Median Home Value','Median Home Value 2010']]
    # pprint(dat_df.describe())
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

create_geoJSON('1990')
