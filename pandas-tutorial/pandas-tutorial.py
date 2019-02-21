import numpy as np
import pandas as pd

## Loading data into a DataFrame
weather = pd.read_csv('weather_data_nyc_centralpark_2016.csv')
print(weather)

## Head and Tail
print(weather.head())
print(weather.tail())

## Accessing a Column
print(weather['date'])
print(weather[['date','average temperature']].head())
print(weather['precipitation'].tail())
weather['dummy'] = 0
print(weather['dummy'].value_counts())

## Metadata and Summary Data
print(weather.shape)
print(weather.describe())
print(weather.dtypes)
print(weather['snow depth'].value_counts())
# print(weather['snow depth'].mean())

## Indexing
print(weather.iloc[0])
print(weather.iloc[:20])

## Filtering
coldDays = weather.loc[weather['average temperature'] < 25.0]
print(coldDays.shape)
print(coldDays['minimum temperature'].min())
weatherFiltered = weather.loc[(weather['precipitation'] <> 'T') & (weather['snow fall'] <> 'T') & (weather['snow depth'] <> 'T')]
print(weatherFiltered.shape)

## Changing Data and Metadata
weather.loc[weather['precipitation'] == 'T','precipitation'] = np.nan
print(weather.iloc[8])
weather.loc[weather['snow depth'] == 'T','snow depth'] = np.nan
wweather.loc[weather['snow fall'] == 'T','snow fall'] = np.nan

weather['precipitation'] = pd.to_numeric(weather['precipitation'])
weather['snow fall'] = pd.to_numeric(weather['snow fall'])
weather['snow depth'] = pd.to_numeric(weather['snow depth'])

print(weather.dtypes)
print(weather.describe())

## Joins
weather['date_new'] = pd.to_datetime(weather['date'])
weather['month'] = weather['date_new'].dt.month
weather['day'] = weather['date_new'].dt.day
weather['year'] = weather['date_new'].dt.year

jan = weather.loc[weather['month'] == 1]
feb = weather.loc[weather['month'] == 2]

jan_feb = jan.merge(feb,on='day',suffixes=('_jan','_feb'))
print(jan_feb.loc[jan_feb['day']==1,('average temperature_jan','average temperature_feb')])
