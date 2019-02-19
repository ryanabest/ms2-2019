import requests
import json
solditems = requests.get('https://api.census.gov/data/2017/acs/acs5/profile?get=DP05_0037PE,DP03_0119PE,NAME&for=tract:*&in=state:36&in=county:047,119,085,005,061,081')
data = solditems.json()
with open('data/censusRawData.json', 'w') as f:
    json.dump(data, f)
