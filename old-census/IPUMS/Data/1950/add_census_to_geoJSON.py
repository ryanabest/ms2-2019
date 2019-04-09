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
           'B08001':      'Less than $3,000'
          ,'B08002':      '$3,000 to $3,999'
          ,'B08003':      '$4,000 to $,4,999'
          ,'B08004':      '$5,000 to $7,499'
          ,'B08005':      '$7,500 to $,9999'
          ,'B08006':      '$10,000 to $14,999'
          ,'B08007':      '$15,000 or more'
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
    dat_df = pd.read_csv('../../Raw/'+year+'/nhgis0012_ds82_'+year+'_tract.csv')
    pprint(gis_df.shape)
    dat_df = dat_df.loc[dat_df['STATEA']==36,:]
    # dat_df['TotalPopCheck'] =  dat_df['BM4001'] + dat_df['BM4002'] + dat_df['BM4003'] + dat_df['BM4004'] + dat_df['BM4005']
    # dat_df['GoodPop'] = dat_df['TotalPopCheck']-dat_df['BLW001']
    # pprint(dat_df['GoodPop'].describe())

    pprint(dat_df.shape)
    # dat_df = dat_df.loc[dat_df['B0Z001']>0,:] ## Non-zero total occupied housing units
    # dat_df = dat_df.loc[dat_df['B09001']>0,:] ## Non-zero median home value
    # dat_df.loc[dat_df['B09001']==0,'B09001'] = np.nan ## Non-zero median home value
    # dat_df = dat_df.loc[dat_df['BZ8001']>0,:] ## Non-zero total population


    dat_df['Total Population'] = dat_df['BZ8001']
    dat_df['Percent White'] = dat_df['B0J001'] / dat_df['BZ8001']
    dat_df['Percent Non-White'] = 1 - dat_df['Percent White']
    dat_df['Percent Black'] = dat_df['B0J002'] / dat_df['BZ8001']
    dat_df['Homeownership Rate'] = dat_df['B0T001'] / (dat_df['B0T001']+dat_df['B0T002']+dat_df['B0T003']+dat_df['B0T004'])
    dat_df['Median Home Value Denominator'] = dat_df['B08001']+ dat_df['B08002']+ dat_df['B08003']+ dat_df['B08004']+ dat_df['B08005']+ dat_df['B08006']+ dat_df['B08007']
    dat_df['Median Home Value'] = dat_df['B09001']
    dat_df['Median Home Value Est'] = dat_df.apply(est_median,axis=1)
    dat_df.loc[dat_df['Median Home Value'] == 0,['Median Home Value']] = dat_df['Median Home Value Est'] ## For any tracts with 0 median home value, sub in estimated value based on bands
    dat_df['Median Home Value 2010'] = dat_df['Median Home Value']*inflation[year]
    pprint(dat_df[['Median Home Value','Median Home Value Est','Median Home Value 2010']].describe())
    #
    # # pprint(dat_df[['B0T001','B0Z001','Homeownership Rate']].describe())
    # # pprint(dat_df.loc[dat_df['Homeownership Rate'] == np.inf,['B0T001','B0Z001','Homeownership Rate']])
    # # dat_df['value_diff'] = dat_df['Median Home Value'] - dat_df['Median Home Value Est']
    # # pprint(dat_df.loc[dat_df['Median Home Value'] == 0,['Median Home Value Est']].describe())
    # # pprint(dat_df['value_diff'].describe())
    #
    # pprint(dat_df.shape)
    # dat_df = dat_df.loc[dat_df['Total Population']>0,:] ## Remove all tracts without any population
    # dat_df =dat_df[['GISJOIN','Total Population','Percent Non-White','Percent White','Percent Black','Homeownership Rate','Median Home Value Denominator','Median Home Value','Median Home Value 2010']]
    # dat_df.loc[dat_df['Median Home Value']==0,['Median Home Value','Median Home Value 2010']] = np.nan
    # pprint(dat_df.shape)
    #
    # # pprint(dat_df.describe())
    #
    # prop_df = gis_df.merge(dat_df,how='inner',on='GISJOIN')
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
    #
    # with open(year+'.json','w') as f:
    #     json.dump(geoJSON_export,f)

create_geoJSON('1950')



# pprint(prop_df.loc[prop_df['GISJOIN']=='G3600610008100',['Total Population','Total Dwelling Units','Owner Occuped Dwelling Units']])
