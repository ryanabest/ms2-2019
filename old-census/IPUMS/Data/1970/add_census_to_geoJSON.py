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
    value_cols = ['CG7001','CG7002','CG7003','CG7004','CG7005','CG7006','CG7007','CG7008','CG7009','CG7010','CG7011']
    value_col_names = {
           'CG7001':      'Less than $5000'
          ,'CG7002':      '$5000-$7499'
          ,'CG7003':      '$7500-$9999'
          ,'CG7004':      '$10000-$12499'
          ,'CG7005':      '$12500-$14999'
          ,'CG7006':      '$15000-$17499'
          ,'CG7007':      '$17500-$19999'
          ,'CG7008':      '$20000-$24999'
          ,'CG7009':      '$25000-$34999'
          ,'CG7010':      '$35000-$49999'
          ,'CG7011':      '$50000 or more'
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
    dat1_df = pd.read_csv('../../Raw/'+year+'/nhgis0007_ds95_'+year+'_tract.csv')
    dat2_df = pd.read_csv('../../Raw/'+year+'/nhgis0007_ds96_'+year+'_tract.csv')
    dat3_df = pd.read_csv('../../Raw/'+year+'/nhgis0007_ds98_'+year+'_tract.csv')
    dat1_df = dat1_df.loc[dat1_df['STATEA']==36,:]
    dat2_df = dat2_df.loc[dat2_df['STATEA']==36,:]
    dat3_df = dat3_df.loc[dat3_df['STATEA']==36,:]
    dat_df = dat1_df.merge(dat2_df,how='outer',on='GISJOIN').merge(dat3_df,how='outer',on='GISJOIN')

    # pprint(dat_df['GISJOIN'].describe())
    pprint(dat_df.shape)
    # dat_df = dat_df.loc[dat_df['CA5001']>0,:] ## Non-zero total occupied housing units
    # dat_df = dat_df.loc[dat_df['CA4001']>0,:] ## Non-zero total population

    dat_df['Total Population'] = dat_df['C0X001']+dat_df['C0X002']+dat_df['C0X003']
    dat_df['Percent Non-White'] = (dat_df['C0X002']+dat_df['C0X003']) / dat_df['Total Population']
    dat_df['Percent White'] = dat_df['C0X001'] / dat_df['Total Population']
    dat_df['Percent Black'] = dat_df['C0X002'] / dat_df['Total Population']
    dat_df['Homeownership Rate'] = (dat_df['CFA001']+dat_df['CFA002']) / (dat_df['CFA001']+dat_df['CFA002']+dat_df['CFA003']+dat_df['CFA004'])
    # dat_df['Median Home Value'] = dat_df['B09001']
    dat_df['Median Home Value Denominator'] = dat_df['CG7001']+dat_df['CG7002']+dat_df['CG7003']+dat_df['CG7004']+dat_df['CG7005']+dat_df['CG7006']+dat_df['CG7007']+dat_df['CG7008']+dat_df['CG7009']+dat_df['CG7010']+dat_df['CG7011']
    dat_df['Median Home Value'] = dat_df.apply(est_median,axis=1) ## estimate based on distribution across discrete categories
    dat_df['Median Home Value 2010'] = dat_df['Median Home Value']*inflation[year]

    # pprint(dat_df[['Percent White','Percent Non-White','Percent Black','Homeownership Rate','Median Home Value','Median Home Value 2010']].head())

    # pprint(dat_df['Median Home Value 2010'].describe())

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

create_geoJSON('1970')
