from io import open
from os.path import splitext
from glob import glob
import re
import json

files = glob('*.txt') # this will match any filename ending in ".txt"
years = {}

def extract(file):
    with open(file) as f:
        year = splitext(file)[0]
        lines = f.readlines()
        movies = []
        for line in lines:
            line = line.strip()
            m = re.search(r"(\d+)\.\s*(.*)\((\d+) mentions",line)
            if m:
                rank = int(m.group(1))
                title = m.group(2)
                mentions = int(m.group(3))
                lineDict = dict(rank=rank,title=title,mentions=mentions)
                movies.append(lineDict)
            else:
                print 'didnt work'

        years[year] = movies

for file in files:
    extract(file)

print(years)
# with file('polls.json','w') as f:
#     json.dump(years, f, indent=2)
