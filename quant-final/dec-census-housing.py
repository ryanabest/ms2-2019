import requests
import json

tracts = '*' ## All
states = '36' ## New York .. https://www.census.gov/geo/reference/ansi_statetables.html
counties = '047,119,085,005,061,081' ## NYC and Westchester .. https://www2.census.gov/geo/docs/reference/codes/files/st36_ny_cou.txt
columns_2010 = 'H001001,H004001,H004002,H004003,H004004' ## Housing Characteristics - https://api.census.gov/data/2010/dec/sf1/variables.html
columns_2010 += ',NAME' ## Census Name

url_2010 = 'https://api.census.gov/data/2010/dec/sf1?get='+columns_2010+'&for=tract:'+tracts+'&in=state:'+states+'&in=county:'+counties
resp_2010 = requests.get(url_2010)
data_2010 = resp_2010.json()
with open('data/housing/censusHousing_2010.json','w') as f:
    json.dump(data_2010,f)

columns_2000 = 'H001001,H004001,H004002,H004003' ## Housing Characteristics - https://api.census.gov/data/2000/sf1/variables.html
columns_2000 += ',NAME' ## Census Name
url_2000 = 'https://api.census.gov/data/2000/sf1?get='+columns_2000+'&for=tract:'+tracts+'&in=state:'+states+'&in=county:'+counties

resp_2000 = requests.get(url_2000)
data_2000 = resp_2000.json()
with open('data/housing/censusHousing_2000.json','w') as f:
    json.dump(data_2000,f)

columns_1990 = 'H0010001,H0030001,H0030002' ## Housing Characteristics - https://api.census.gov/data/2000/sf1/variables.html
# columns_1990 += ',NAME' ## Census Name
ninety = []
for c in counties.split(','):
    url_1990 = 'https://api.census.gov/data/1990/sf1?get='+columns_1990+'&for=tract:'+tracts+'&in=state:'+states+'%20county:'+c
    resp_1990 = requests.get(url_1990)
    data_1990 = resp_1990.json()
    for d in data_1990:
        if c != '047' and d[0] == 'H0010001':
            print("SKIP!")
        else:
            ninety.append(d)

# print(ninety)
with open('data/housing/censusHousing_1990.json','w') as f:
    json.dump(ninety,f)
