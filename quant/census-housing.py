import requests
import json

tracts = '*' ## All
states = '36' ## New York .. https://www.census.gov/geo/reference/ansi_statetables.html
counties = '047,119,085,005,061,081' ## NYC and Westchester .. https://www2.census.gov/geo/docs/reference/codes/files/st36_ny_cou.txt
columns = 'group(DP04)' ## Housing Characteristics
columns += ',NAME' ## Census Name

url = 'https://api.census.gov/data/2017/acs/acs5/profile?get='+columns+'&for=tract:'+tracts+'&in=state:'+states+'&in=county:'+counties

resp = requests.get(url)
data = resp.json()
with open('Housing/data/censusHousing.json','w') as f:
    json.dump(data,f)
