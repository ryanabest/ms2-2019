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
    value_cols = ['JTGE002','JTGE003','JTGE004','JTGE005','JTGE006','JTGE007','JTGE008','JTGE009','JTGE010','JTGE011','JTGE012','JTGE013','JTGE014','JTGE015','JTGE016','JTGE017','JTGE018','JTGE019','JTGE020','JTGE021','JTGE022','JTGE023','JTGE024','JTGE025'
    ]
    value_col_names = {
               'JTGE002':     'Less than $10,000'
              ,'JTGE003':     '$10,000 to $14,999'
              ,'JTGE004':     '$15,000 to $19,999'
              ,'JTGE005':     '$20,000 to $24,999'
              ,'JTGE006':     '$25,000 to $29,999'
              ,'JTGE007':     '$30,000 to $34,999'
              ,'JTGE008':     '$35,000 to $39,999'
              ,'JTGE009':     '$40,000 to $49,999'
              ,'JTGE010':     '$50,000 to $59,999'
              ,'JTGE011':     '$60,000 to $69,999'
              ,'JTGE012':     '$70,000 to $79,999'
              ,'JTGE013':     '$80,000 to $89,999'
              ,'JTGE014':     '$90,000 to $99,999'
              ,'JTGE015':     '$100,000 to $124,999'
              ,'JTGE016':     '$125,000 to $149,999'
              ,'JTGE017':     '$150,000 to $174,999'
              ,'JTGE018':     '$175,000 to $199,999'
              ,'JTGE019':     '$200,000 to $249,999'
              ,'JTGE020':     '$250,000 to $299,999'
              ,'JTGE021':     '$300,000 to $399,999'
              ,'JTGE022':     '$400,000 to $499,999'
              ,'JTGE023':     '$500,000 to $749,999'
              ,'JTGE024':     '$750,000 to $999,999'
              ,'JTGE025':     '$1,000,000 or more'
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
        if tract['properties']['STATEFP10'] == '36':
            tracts.append(tract)
            props.append(tract['properties'])

    gis_df = pd.DataFrame(props)
    dat1_df = pd.read_csv('../../Raw/'+year+'/nhgis0011_ds172_'+year+'_tract.csv', encoding = "ISO-8859-1")
    dat2_df = pd.read_csv('../../Raw/'+year+'/nhgis0011_ds176_'+year+'5_2010_tract.csv', encoding = "ISO-8859-1")
    dat_df = dat1_df.merge(dat2_df,how='outer',on='GISJOIN')

    dat_df = dat_df.loc[dat_df['COUNTY_x'] == 'Bronx County',:]
    dat_df = dat_df.loc[dat_df['GISJOIN']=='G3600050032300',:]
    # print(dat1_df.shape,dat2_df.shape)
    # pprint(dat_df['GISJOIN'].describe())
    # pprint(dat_df['COUNTY_x'].value_counts())

    # pprint(dat_df.loc[dat_df['GISJOIN']=='G3600050032300',:])
    dat_df['Total Population'] = dat_df['H7V001']
    # dat_df['PopCheck'] = dat_df['H7X002']+dat_df['H7X003']+dat_df['H7X004']+dat_df['H7X005']+dat_df['H7X006']+dat_df['H7X007']+dat_df['H7X008']
    # dat_df['check'] = dat_df['Total Population']-dat_df['PopCheck']
    # print(dat_df['check'].describe())
    dat_df['Percent White'] = dat_df['H7X002'] / dat_df['Total Population']
    dat_df['Percent Non-White'] = 1 - dat_df['Percent White']
    dat_df['Percent Black'] = dat_df['H7X003'] / dat_df['Total Population']

    dat_df['Homeownership Rate'] = (dat_df['IFF002']+dat_df['IFF003']) / dat_df['IFF001']

    dat_df['Median Home Value'] = dat_df['JTIE001']
    dat_df['Median Home Value Denominator'] = dat_df['JTGE001']
    dat_df['Median Home Value Est'] = dat_df.apply(est_median,axis=1) ## estimate based on distribution across discrete categories
    dat_df['Median Home Value 2010'] = dat_df['Median Home Value']*inflation[year]
    dat_df['hv_diff'] = dat_df['Median Home Value'] - dat_df['Median Home Value Est']
    # pprint(dat_df[['Median Home Value','Median Home Value Est']].describe())
    # print(dat_df.shape)
    # print(dat_df['hv_diff'].describe())
    # pprint(dat_df[['Percent White','Percent Non-White','Percent Black','Homeownership Rate','Median Home Value','Median Home Value 2010']].head())

    pprint(dat_df.shape)
    dat_df = dat_df.loc[dat_df['Total Population']>0,:] ## Remove all tracts without any population
    dat_df =dat_df[['GISJOIN','Total Population','Percent Non-White','Percent White','Percent Black','Homeownership Rate','Median Home Value Denominator','Median Home Value','Median Home Value 2010']]
    pprint(dat_df.describe())
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
    # with open(year+'.json','w') as f:
    #     json.dump(geoJSON_export,f)

create_geoJSON('2010')
