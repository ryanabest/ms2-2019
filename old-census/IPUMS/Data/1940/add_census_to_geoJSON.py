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
    value_col_names = {
            'BVB001':      'Under $500'
           ,'BVB002':      '$500 - $699'
           ,'BVB003':      '$700 - $999'
           ,'BVB004':      '$1000 - $1499'
           ,'BVB005':      '$1500 - $1999'
           ,'BVB006':      '$2000 - $2499'
           ,'BVB007':      '$2500 - $2999'
           ,'BVB008':      '$3000 - $3999'
           ,'BVB009':      '$4000 - $4999'
           ,'BVB010':      '$5000 - $5999'
           ,'BVB011':      '$6000 - $7499'
           ,'BVB012':      '$7500 - $9999'
           ,'BVB013':      '$10000 - $14999'
           ,'BVB014':      '$15000 - $19999'
           ,'BVB015':      '$20000+'
    }
    value_cols = value_col_names.keys()

    for col in value_cols:
        running_total += row[col]
        if running_total >= row[total_col] / 2:
            range = list(map(int,re.findall(r"(\d+)",value_col_names[col].replace(",",""))))
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
    dat_df = pd.read_csv('../../Raw/'+year+'/nhgis0013_ds76_'+year+'_tract.csv')
    pprint(dat_df.shape)
    dat_df = dat_df.loc[dat_df['STATEA']==36,:]
    pprint(dat_df.shape)
    # dat_df = dat_df.rename(columns={
    #      "BUB001":"Total Population"
    #     ,"BUQ001":"White Population"
    #     ,"BUQ002":"Non-White Population"
    #     ,"BVG001":"Black Population"
    #     ,"BVP001":"Occupied Dwelling Units"
    #     ,"BU1001":"Total Dwelling Units"
    #     ,"BU2001":"Owner Occupied Dwelling Units"
    #     ,"BU2002":"Tenant Occupied Dwelling Units"
    #     ,"BU3001":"Owner Occupied White"
    #     ,"BU3002":"Owner Occupied Black"
    #     ,"BU3003":"Owner Occupied Other Non-White"
    #     ,"BU3004":"Tenant Occupied White"
    #     ,"BU3005":"Tenant Occupied Black"
    #     ,"BU3006":"Tenant Occupied Other Non-White"
    #     ,"BVC001":"Median Home Value"
    # })

    dat_df['Total Population'] = dat_df['BUB001']
    dat_df['Percent Non-White'] = dat_df['BUQ002'] / dat_df['Total Population']
    dat_df['Percent White'] = dat_df['BUQ001'] / dat_df['Total Population']
    dat_df['Percent Black'] = dat_df['BVG001'] / dat_df['Total Population']
    dat_df['Homeownership Rate'] = dat_df['BU2001'] / (dat_df['BU2001'] + dat_df['BU2002'])
    dat_df['Median Home Value'] = dat_df['BVC001']
    dat_df['Median Home Value Denominator'] = dat_df['BVB001']+dat_df['BVB002']+dat_df['BVB003']+dat_df['BVB004']+dat_df['BVB005']+dat_df['BVB006']+dat_df['BVB007']+dat_df['BVB008']+dat_df['BVB009']+dat_df['BVB010']+dat_df['BVB011']+dat_df['BVB012']+dat_df['BVB013']+dat_df['BVB014']+dat_df['BVB015']
    dat_df['Median Home Value Est'] = dat_df.apply(est_median,axis=1)
    dat_df.loc[dat_df['Median Home Value'] == 0,['Median Home Value']] = dat_df['Median Home Value Est'] ## For any tracts with 0 median home value, sub in estimated value based on bands
    dat_df['Median Home Value 2010'] = dat_df['Median Home Value']*inflation[year]
    
    # pprint(dat_df.loc[dat_df['Median Home Value'] == 0,:].describe())
    # pprint(dat_df.loc[dat_df['Median Home Value'] == 0,['Median Home Value Est']].describe())

    pprint(dat_df.shape)
    dat_df = dat_df.loc[dat_df['Total Population']>0,:] ## Remove all tracts without any population
    dat_df =dat_df[['GISJOIN','Total Population','Percent Non-White','Percent White','Percent Black','Homeownership Rate','Median Home Value Denominator','Median Home Value','Median Home Value 2010']]
    dat_df.loc[dat_df['Median Home Value']==0,['Median Home Value','Median Home Value 2010']] = np.nan
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

create_geoJSON('1940')



# pprint(prop_df.loc[prop_df['GISJOIN']=='G3600610008100',['Total Population','Total Dwelling Units','Owner Occuped Dwelling Units']])
