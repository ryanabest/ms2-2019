import requests
from io import open

## Write Polls File ##
# r = requests.get("https://ms2.samizdat.co/2019/static/s+s/")
# with open('polls.html','w') as file:
#     file.write(r.text)

## Write Each Year File ##
years = ["https://ms2.samizdat.co/2019/static/s+s/1952.txt","https://ms2.samizdat.co/2019/static/s+s/1962.txt","https://ms2.samizdat.co/2019/static/s+s/1972.txt","https://ms2.samizdat.co/2019/static/s+s/1982.txt","https://ms2.samizdat.co/2019/static/s+s/1992.txt","https://ms2.samizdat.co/2019/static/s+s/2002.txt","https://ms2.samizdat.co/2019/static/s+s/2012.txt"]
for year in years:
    fileName = year.split('/')[-1]
    r = requests.get(year)
    with open(fileName,'w') as file:
        file.write(r.text)
