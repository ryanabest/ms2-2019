import requests
import json

tracts = '*' ## All
states = '36' ## New York .. https://www.census.gov/geo/reference/ansi_statetables.html
counties = '047,119,085,005,061,081' ## NYC and Westchester .. https://www2.census.gov/geo/docs/reference/codes/files/st36_ny_cou.txt
columns = 'DP03_0119PE' ## Percent Estimate!!PERCENTAGE OF FAMILIES AND PEOPLE WHOSE INCOME IN THE PAST 12 MONTHS IS BELOW THE POVERTY LEVEL!!All families
columns += ',DP05_0037PE' ## Percent Estimate!!RACE!!Total population!!One race!!White
columns += ',NAME,GEO_ID' ## Census Name

url = 'https://api.census.gov/data/2017/acs/acs5/profile?get='+columns+'&for=tract:'+tracts+'&in=state:'+states+'&in=county:'+counties
# print(url)
resp = requests.get(url)
data = resp.json()
with open('data/povertyrace/censusPovertyRace.json','w') as f:
    json.dump(data,f)
