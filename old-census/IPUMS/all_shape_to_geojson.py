import os
from pprint import pprint

def ogr(shp,json):
    cmd = 'ogr2ogr -f GeoJSON -t_srs EPSG:4326 '+json+' '+shp
    return cmd

os.system(ogr('/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Raw/1930/nhgis0004_shapefile_tl2000_us_tract_1930/US_tract_1930.shp'\
          ,'/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Data/1930/tract_1930.json'))

os.system(ogr('/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Raw/1940/nhgis0001_shapefile_tl2000_us_tract_1940/US_tract_1940.shp'\
          ,'/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Data/1940/tract_1940.json'))

os.system(ogr('/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Raw/1950/nhgis0005_shapefile_tl2000_us_tract_1950/US_tract_1950.shp'\
          ,'/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Data/1950/tract_1950.json'))

os.system(ogr('/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Raw/1960/nhgis0006_shapefile_tl2000_us_tract_1960/US_tract_1960.shp'\
          ,'/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Data/1960/tract_1960.json'))

os.system(ogr('/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Raw/1970/nhgis0007_shapefile_tl2000_us_tract_1970/US_tract_1970.shp'\
        ,'/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Data/1970/tract_1970.json'))

os.system(ogr('/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Raw/1980/nhgis0008_shapefile_tl2000_us_tract_1980/US_tract_1980.shp'\
          ,'/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Data/1980/tract_1980.json'))

os.system(ogr('/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Raw/1990/nhgis0009_shapefile_tl2000_us_tract_1990/US_tract_1990.shp'\
          ,'/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Data/1990/tract_1990.json'))

os.system(ogr('/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Raw/2000/nhgis0010_shapefile_tl2000_us_tract_2000/US_tract_2000.shp'\
          ,'/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Data/2000/tract_2000.json'))


def ogr10 (shp,json):
    cmd = 'ogr2ogr -f GeoJSON -t_srs EPSG:4326 '+json+' '+shp
    return cmd
os.system(ogr10('/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Raw/2010/nhgis0011_shapefile_tl2010_us_tract_2010/US_tract_2010.shp'\
          ,'/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/old-census/IPUMS/Data/2010/tract_2010.json'))
