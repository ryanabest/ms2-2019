import nltk
import json
import re
from pprint import pprint
from nltk.collocations import *
bigram_measures = nltk.collocations.BigramAssocMeasures()
trigram_measures = nltk.collocations.TrigramAssocMeasures()

dictionary = []
dictionary_a = []
dictionary_b = []
dictionary_c = []
dictionary_d = []
boroughs_areas = []

def addWordToDict(word,dict):
    w = re.sub(r'[^\w\s]','',word)
    if (any(d['word'] == w for d in dict)):
        for d in dict:
            if d['word'] == w:
                d['count'] += 1
    else:
        dict.append({"word":w,"count":1})

def load_borough(borough):
    borough_file = 'data/HOLC_'+borough+'.geojson'
    borough_data = json.load(open(borough_file))['features']
    return borough_data

def parse_feature(feature,borough):
    grade       = feature['properties']['holc_grade']
    holc_id     = feature['properties']['holc_id']

    if 'area_description_data' in feature['properties'].keys():
        if (any(d['borough'] == borough for d in boroughs_areas)):
            for d in boroughs_areas:
                if d['borough'] == borough:
                    d['overall'] += 1
        else:
            boroughs_areas.append({"borough":borough,"overall":1,"favorable":0,"detrimental":0,"clarifying":0})

        description = feature['properties']['area_description_data']

        ## favorable
        if '1b' in description.keys():
            for d in boroughs_areas:
                if d['borough'] == borough:
                    d['favorable'] += 1

            favorable = description['1b']
            favorable_single = favorable.lower().split(' ')
            for word in favorable_single:
                addWordToDict(word,dictionary)
                if grade =='A':
                    addWordToDict(word,dictionary_a)
                elif grade == 'B':
                    addWordToDict(word,dictionary_b)
                elif grade == 'C':
                    addWordToDict(word,dictionary_c)
                elif grade == 'D':
                    addWordToDict(word,dictionary_d)

        ## detrimental
        if '1c' in description.keys():
            for d in boroughs_areas:
                if d['borough'] == borough:
                    d['detrimental'] += 1

            detrimental = description['1c']
            detrimental_single = detrimental.lower().split(' ')
            for word in detrimental_single:
                addWordToDict(word,dictionary)
                if grade =='A':
                    addWordToDict(word,dictionary_a)
                elif grade == 'B':
                    addWordToDict(word,dictionary_b)
                elif grade == 'C':
                    addWordToDict(word,dictionary_c)
                elif grade == 'D':
                    addWordToDict(word,dictionary_d)

        ## clarifying
        if '5' in description.keys():
            for d in boroughs_areas:
                if d['borough'] == borough:
                    d['clarifying'] += 1

            clarifying = description['5']
            clarifying_single = clarifying.lower().split(' ')
            for word in clarifying_single:
                addWordToDict(word,dictionary)
                if grade =='A':
                    addWordToDict(word,dictionary_a)
                elif grade == 'B':
                    addWordToDict(word,dictionary_b)
                elif grade == 'C':
                    addWordToDict(word,dictionary_c)
                elif grade == 'D':
                    addWordToDict(word,dictionary_d)


boroughs = ['BergenCo','Bronx','Brooklyn','EssexCounty','LowerWestchesterCo','Manhattan','Queens','StatenIsland']
# boroughs = ['Bronx','Brooklyn','Manhattan'] ## These boroughs are the ones with area scans AND descriptions
for borough in boroughs:
    boro = load_borough(borough)
    for b in boro:
        parse_feature(b,borough)

def list_to_csv(list,name):
    # pprint(list)
    csv = 'word,count\r\n'
    for d in list:
        csv += d['word'] + ',' + str(d['count']) + '\r\n'
    with open(name,'w') as file:
        file.write(csv)


list_to_csv(dictionary  ,'dictionaries/dictionary.csv')
list_to_csv(dictionary_a,'dictionaries/dictionary_a.csv')
list_to_csv(dictionary_b,'dictionaries/dictionary_b.csv')
list_to_csv(dictionary_c,'dictionaries/dictionary_c.csv')
list_to_csv(dictionary_d,'dictionaries/dictionary_d.csv')

print(boroughs_areas)

#### RESULTS: ####
'''
[
    {'borough': 'Bronx', 'overall': 44, 'favorable': 43, 'detrimental': 43, 'clarifying': 43},
    {'borough': 'Brooklyn', 'overall': 64, 'favorable': 64, 'detrimental': 64, 'clarifying': 64},
    {'borough': 'Manhattan', 'overall': 53, 'favorable': 41, 'detrimental': 41, 'clarifying': 41}
]
'''

# change this to read in your data
# finder = TrigramCollocationFinder.from_words(nltk.wordpunct_tokenize(remarks))

# only bigrams that appear 3+ times
# finder.apply_freq_filter(3)

# return the 10 n-grams with the highest PMI
# print(finder.nbest(trigram_measures.pmi, 10))

# tokens = nltk.wordpunct_tokenize(remarks)
# finder = BigramCollocationFinder.from_words(tokens)
# scored = finder.score_ngrams(bigram_measures.raw_freq)
#
# print(sorted(bigram for bigram, score in scored))

# def collcation(text):
    # pprint(text)
