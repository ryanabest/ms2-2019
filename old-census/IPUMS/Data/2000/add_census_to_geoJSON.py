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
    value_cols = ['GB5001','GB5002','GB5003','GB5004','GB5005','GB5006','GB5007','GB5008','GB5009','GB5010','GB5011','GB5012','GB5013','GB5014','GB5015','GB5016','GB5017','GB5018','GB5019','GB5020','GB5021','GB5022','GB5023','GB5024'
    ]
    value_col_names = {
              'GB5001':      'Less than $10,000'
             ,'GB5002':      '$10,000 to $14,999'
             ,'GB5003':      '$15,000 to $19,999'
             ,'GB5004':      '$20,000 to $24,999'
             ,'GB5005':      '$25,000 to $29,999'
             ,'GB5006':      '$30,000 to $34,999'
             ,'GB5007':      '$35,000 to $39,999'
             ,'GB5008':      '$40,000 to $49,999'
             ,'GB5009':      '$50,000 to $59,999'
             ,'GB5010':      '$60,000 to $69,999'
             ,'GB5011':      '$70,000 to $79,999'
             ,'GB5012':      '$80,000 to $89,999'
             ,'GB5013':      '$90,000 to $99,999'
             ,'GB5014':      '$100,000 to $124,999'
             ,'GB5015':      '$125,000 to $149,999'
             ,'GB5016':      '$150,000 to $174,999'
             ,'GB5017':      '$175,000 to $199,999'
             ,'GB5018':      '$200,000 to $249,999'
             ,'GB5019':      '$250,000 to $299,999'
             ,'GB5020':      '$300,000 to $399,999'
             ,'GB5021':      '$400,000 to $499,999'
             ,'GB5022':      '$500,000 to $749,999'
             ,'GB5023':      '$750,000 to $999,999'
             ,'GB5024':      '$1,000,000 or more'
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
    dat1_df = pd.read_csv('../../Raw/'+year+'/nhgis0010_ds146_'+year+'_tract.csv')
    dat2_df = pd.read_csv('../../Raw/'+year+'/nhgis0010_ds151_'+year+'_tract.csv')
    dat_df = dat1_df.merge(dat2_df,how='outer',on='GISJOIN')

    # print(dat1_df.shape,dat2_df.shape)
    # pprint(dat_df['GISJOIN'].describe())
    # pprint(dat_df.shape)


    dat_df['Total Population'] = dat_df['FL5001']
    # dat_df['PopCheck'] = dat_df['FMR001']+dat_df['FMR002']+dat_df['FMR003']+dat_df['FMR004']+dat_df['FMR005']+dat_df['FMR006']+dat_df['FMR007']
    # dat_df['check'] = dat_df['Total Population']-dat_df['PopCheck']
    # print(dat_df['check'].describe())
    dat_df['Percent White'] = dat_df['FMR001'] / dat_df['Total Population']
    dat_df['Percent Non-White'] = 1 - dat_df['Percent White']
    dat_df['Percent Black'] = dat_df['FMR002'] / dat_df['Total Population']

    dat_df['Homeownership Rate'] = dat_df['FKN001'] / (dat_df['FKN001']+dat_df['FKN002'])

    dat_df['Median Home Value'] = dat_df['GB7001']
    dat_df['Median Home Value Denominator'] = dat_df['GB5001']+dat_df['GB5002']+dat_df['GB5003']+dat_df['GB5004']+dat_df['GB5005']+dat_df['GB5006']+dat_df['GB5007']+dat_df['GB5008']+dat_df['GB5009']+dat_df['GB5010']+dat_df['GB5011']+dat_df['GB5012']+dat_df['GB5013']+dat_df['GB5014']+dat_df['GB5015']+dat_df['GB5016']+dat_df['GB5017']+dat_df['GB5018']+dat_df['GB5019']+dat_df['GB5020']+dat_df['GB5021']+dat_df['GB5022']+dat_df['GB5023']+dat_df['GB5024']
    dat_df['Median Home Value Est'] = dat_df.apply(est_median,axis=1) ## estimate based on distribution across discrete categories
    dat_df['Median Home Value 2010'] = dat_df['Median Home Value']*inflation[year]
    # dat_df['hv_diff'] = dat_df['Median Home Value'] - dat_df['Median Home Value Est']
    # print(dat_df['hv_diff'].describe())
    # pprint(dat_df[['Percent White','Percent Non-White','Percent Black','Homeownership Rate','Median Home Value','Median Home Value 2010']].head())

    pprint(dat_df.shape)
    dat_df = dat_df.loc[dat_df['Total Population']>0,:] ## Remove all tracts without any population
    dat_df =dat_df[['GISJOIN','Total Population','Percent Non-White','Percent White','Percent Black','Homeownership Rate','Median Home Value Denominator','Median Home Value','Median Home Value 2010']]
    dat_df.loc[dat_df['Median Home Value']==0,['Median Home Value','Median Home Value 2010']] = np.nan
    # pprint(dat_df.loc[dat_df['Median Home Value'] == 0,:].describe())
    # pprint(dat_df.describe())
    pprint(dat_df.shape)
    prop_df = gis_df.merge(dat_df,how='inner',on='GISJOIN')

    features = []

    for tract in tracts:
        if len(prop_df.loc[prop_df['GISJOIN'] == tract['properties']['GISJOIN']]) > 0:
            properties = prop_df.loc[prop_df['GISJOIN'] == tract['properties']['GISJOIN']].to_dict('records')[0]

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

create_geoJSON('2000')
