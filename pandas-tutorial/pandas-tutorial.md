# _pandas_ Tutorial (MS<sup>2</sup> 2.20.19)

### What is _pandas_?

![pandas logo](https://pandas.pydata.org/_static/pandas_logo.png)

> In computer programming, _pandas_ is a software library written for the Python programming language for data manipulation and analysis. In particular, it offers data structures and operations for manipulating numerical tables and time series [_Wikipedia_](https://en.wikipedia.org/wiki/Pandas_(software)

_[pandas](https://pandas.pydata.org/)_ is an open source Python library that provides some really easy-to-use and performant data structures and analysis tools/frameworks. I've mostly used it for making data cleaning, organization, and preparation easier, but _pandas_ also contains a suite of exciting analysis and modeling tools. _pandas_ can do a lot of the analysis and statistics that R does, but allows you to stay within Python instead of switching to this more domain specific language. Check out [this page](https://pandas.pydata.org/pandas-docs/stable/getting_started/overview.html) for a great list of all the things that _pandas_ does really well. It also has a fantastic [documentation section](https://pandas.pydata.org/pandas-docs/stable/index.html) and a ton of users worldwide (that have already answered so many questions we may have on [StackOverflow](https://stackoverflow.com/questions/tagged/pandas?pageSize=15&sort=votes)), which goes a long way in making it a __really easy__ third-party package to use.

#### Getting Set Up

To use _pandas_, we first need to [install it](https://pandas.pydata.org/pandas-docs/stable/install.html) to our machine since it's not in the Python standard library. So, let's hop into the command line and create a new folder for our session today:

```bash
mkdir pandas-tutorial
cd pandas-tutorial
```

Next, let's follow the [steps Christian laid out](https://ms2.samizdat.co/2019/python-tutorial/) to create a [virtual environment](https://github.com/pypa/virtualenv) for this project:

```bash
virtualenv env
source ./env/bin/activate
```

(remember, we can always get out of our venv with deactivate):

```bash
deactivate
```

Now we need to install _pandas_. _pandas_ is often used alongside another package named [NumPy](https://www.numpy.org/), which is actually a dependency for _pandas_. Let's use pip to install them both:

```bash
pip install pandas numpy
```

Now we're ready to use _pandas_ in a Python script! Just like we did with modules from the standard library in Christian's session, we can now import pandas to use it in our script and give it a shorthand (you should be able to run this script without getting an error to the console):

```python
import numpy as np
import pandas as pd
```

## Basic _pandas_ Concepts

### Data Structures

There are two main data structures in _pandas_:

| Dimensions | Name | Official Description | Ryan's Oversimplification |
|---|---|---|
| 1 | Series | 1D labeled homogeneously-typed array | Columns |
| 2 | DataFrame | General 2D labeled, size-mutable tabular structure with potentially heterogeneously-typed column | Tables |

The vast majority of what I've done with _pandas_ consists of me putting data from a _json_, _csv_, or other raw file into DataFrames and manipulating those DataFrames to organize or clean the data how I want it. This first section will cover how to get data into a DataFrame and understand what that data looks like. The next section will get into a few of the concepts you can use to manipulate that data with _pandas_.

### Loading Data Into a DataFrame

The data we've picked to use for this session is a csv with daily records of the weather in Central Park in 2016 from [Kaggle](https://www.kaggle.com/mathijs/weather-data-in-new-york-city-2016). Let's download that csv and save it in our _pandas-tutorial_ directory.

We can use the [read_csv](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.read_csv.html) command to load a csv into a DataFrame. The documentation looks intimidating, but there's actually only one parameter that's required to load a DataFrame, which is the _filepath_or_buffer_ parameter, which just tells _pandas_ where the csv is that we want to load. The rest of the parameters have default values that should work for our csv in this case:

```Python
import numpy as np
import pandas as pd
weather = pd.read_csv('weather_data_nyc_centralpark_2016.csv')
```

### Head and Tail

To see a sub-section of our new dataframe, we can use the _head( )_ command to look at the _first_ 5 rows of our data and the _tail( )_ command to look at the _last_ 5 rows:

```python
weather.head()

## Output: ##
       date  maximum temperature  minimum temperature  average temperature precipitation snow fall snow depth
0  1-1-2016                   42                   34                 38.0          0.00       0.0          0
1  2-1-2016                   40                   32                 36.0          0.00       0.0          0
2  3-1-2016                   45                   35                 40.0          0.00       0.0          0
3  4-1-2016                   36                   14                 25.0          0.00       0.0          0
4  5-1-2016                   29                   11                 20.0          0.00       0.0          0
```

```python
weather.tail()

## Output: ##
           date  maximum temperature  minimum temperature  average temperature precipitation snow fall snow depth
361  27-12-2016                   60                   40                 50.0             0         0          0
362  28-12-2016                   40                   34                 37.0             0         0          0
363  29-12-2016                   46                   33                 39.5          0.39         0          0
364  30-12-2016                   40                   33                 36.5          0.01         T          0
365  31-12-2016                   44                   31                 37.5             0         0          0
```

### Accessing a Column

We can access a specific column by using square brackets after the DataFrame name with the column name in quotes:

```python
weather['date']
```

You can use these column selection (or a combinations of columns) with different operators, like _head( )_ and _tail( )_ :

```python
weather[['date','average temperature']].head()

## Output: ##
       date  average temperature
0  1-1-2016                 38.0
1  2-1-2016                 36.0
2  3-1-2016                 40.0
3  4-1-2016                 25.0
4  5-1-2016                 20.0
```

```python
weather['precipitation'].tail()

## Output: ##
361       0
362       0
363    0.39
364    0.01
365       0
Name: precipitation, dtype: object
```

Or use this syntax to create a totally new column:
```python
weather['dummy'] = 0
weather['dummy'].value_counts()

## Output: ##
0    366
Name: dummy, dtype: int64
```

### Metadata and Summary Data

_pandas_ has some great built-in functions to give us a basic initial understanding of our data. We can use the _shape_ command to see the number of rows and columns present in our dataset:

```python
weather.shape

## Output: ##
(366, 7)
```

We can use _describe( )_ to see a range of useful summary statistics about all the columns in our DataFrame that are numeric:

```python
weather.describe()

## Output: ##
       maximum temperature  minimum temperature  average temperature
count           366.000000           366.000000           366.000000
mean             64.625683            49.806011            57.215847
std              18.041787            16.570747            17.124760
min              15.000000            -1.000000             7.000000
25%              50.000000            37.250000            44.000000
50%              64.500000            48.000000            55.750000
75%              81.000000            65.000000            73.500000
max              96.000000            81.000000            88.500000
```

But wait, there's only three columns here! It looks like _precipitation_, _snow fall_, and _snow depth_ are missing. Let's use the _dtypes_ function to see what the datatype of each column is to try and identify what's going on:

```python
weather.dtypes

## Output: ##
date                    object
maximum temperature      int64
minimum temperature      int64
average temperature    float64
precipitation           object
snow fall               object
snow depth              object
dtype: object
```

Hmm... it looks like these last three columns are coming through as 'object' columns instead of numerical columns. Let's take a look at the distribution of values using the _value_\__counts( )_ command within one of these columns to see if we can't pick out what's happening. Let's start with _snow depth_:

```python
weather['snow depth'].value_counts()

## Output: ##
0     346
T       7
6       4
2       2
1       2
9       1
4       1
19      1
22      1
17      1
Name: snow depth, dtype: int64
```

It looks like this one value of __T__ is preventing summary stats from being calculated for this column when we ran the _describe( )_ command. It turns out based on [Kaggle documentation](https://www.kaggle.com/mathijs/weather-data-in-new-york-city-2016/discussion/39199) that this T means 'trace', meaning something was measured but not enough for a value. This may cause us some additional issues moving forward whenever we need to run calculations on this column. for example:

```Python
weather['snow depth'].mean()

## Output: ##
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/pandas-tutorial/env/lib/python2.7/site-packages/pandas/core/generic.py", line 10956, in stat_func
    numeric_only=numeric_only)
  File "/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/pandas-tutorial/env/lib/python2.7/site-packages/pandas/core/series.py", line 3626, in _reduce
    return op(delegate, skipna=skipna, **kwds)
  File "/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/pandas-tutorial/env/lib/python2.7/site-packages/pandas/core/nanops.py", line 76, in _f
    return f(*args, **kwargs)
  File "/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/pandas-tutorial/env/lib/python2.7/site-packages/pandas/core/nanops.py", line 130, in f
    result = alt(values, axis=axis, skipna=skipna, **kwds)
  File "/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/pandas-tutorial/env/lib/python2.7/site-packages/pandas/core/nanops.py", line 479, in nanmean
    the_sum = _ensure_numeric(values.sum(axis, dtype=dtype_sum))
  File "/Users/ryanbest/Documents/Parsons/ms2-2019/major-studio2-2019/pandas-tutorial/env/lib/python2.7/site-packages/pandas/core/nanops.py", line 1170, in _ensure_numeric
    .format(value=x))
TypeError: Could not convert 00000000000000000TTT006221917966642T001000T00000000000000000000000T0000000000000000T000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000210000000000000 to numeric
```

YUCK that's an ugly error message. We'll get into some examples in the next section of how to filter out these values or replace these values with something a little more useful.

## Handy _pandas_ Functionalities

### Indexing

[Indexing](https://pandas.pydata.org/pandas-docs/stable/user_guide/indexing.html) refers to how we find a particular value in a _pandas_ DataFrame. If we know the row number(s) we want, we can use integer(s) with square brackets after the _.iloc[ ]_ operator. So, if we want the first row of our DataFrame or a particular column we can use an index of 0:

```python
weather.iloc[0]

## Output: ##
date                   1-1-2016
maximum temperature          42
minimum temperature          34
average temperature          38
precipitation              0.00
snow fall                   0.0
snow depth                    0
Name: 0, dtype: object
weather['date'].iloc[0]
'1-1-2016'
```

If we want the first 20 rows, we can index through row 19:

``` python
weather.iloc[:20]

## Output: ##
         date  maximum temperature  minimum temperature  average temperature precipitation snow fall snow depth
0    1-1-2016                   42                   34                 38.0          0.00       0.0          0
1    2-1-2016                   40                   32                 36.0          0.00       0.0          0
2    3-1-2016                   45                   35                 40.0          0.00       0.0          0
3    4-1-2016                   36                   14                 25.0          0.00       0.0          0
4    5-1-2016                   29                   11                 20.0          0.00       0.0          0
5    6-1-2016                   41                   25                 33.0          0.00       0.0          0
6    7-1-2016                   46                   31                 38.5          0.00       0.0          0
7    8-1-2016                   46                   31                 38.5          0.00       0.0          0
8    9-1-2016                   47                   40                 43.5             T       0.0          0
9   10-1-2016                   59                   40                 49.5          1.80       0.0          0
10  11-1-2016                   40                   26                 33.0          0.00       0.0          0
11  12-1-2016                   44                   25                 34.5          0.00         T          0
12  13-1-2016                   30                   22                 26.0          0.00       0.0          0
13  14-1-2016                   38                   22                 30.0          0.00         T          0
14  15-1-2016                   51                   34                 42.5             T       0.0          0
15  16-1-2016                   52                   42                 47.0          0.24       0.0          0
16  17-1-2016                   42                   30                 36.0          0.05       0.4          0
17  18-1-2016                   31                   18                 24.5             T         T          T
18  19-1-2016                   28                   16                 22.0          0.00       0.0          T
19  20-1-2016                   37                   27                 32.0          0.00       0.0          T
```

_.iloc[ ]_ operates much in the same way as Python list selection does.

### Filtering
_pandas_ also lets us index on __boolean expressions__, which allows us to filter our data set for particular rows where a given condition is true. The syntax for boolean filtering is _loc[ ]_. Let's use this functionality to find out __how many cold days there were, specifically under 25 degrees F__. First, let's create a subset of our data set called coldDays testing for that condition.

```python
coldDays = weather.loc[weather['average temperature'] < 25.0]
coldDays.shape

## Output: ##
(9, 7)
```

So, it looks like we've got __9 of these cold days__ in 2016.

__What was the minimum temperature during these 9 days?__

```python
coldDays['minimum temperature'].min()

## Output: ##
-1
```

Let's get back to our issue of __'T'__ values, which was trace measurements, but not enough for a reading. Let's filter out any row with these T values into a new DataFrame called weatherFiltered:

```python
weatherFiltered = weather.loc[(weather['precipitation'] <> 'T') & (weather['snow fall'] <> 'T') & (weather['snow depth'] <> 'T')]
weatherFiltered.shape

## Output: ##
(325, 7)
```

So it looks like we filtered out 41 rows of our DataFrame.

### Changing Data and Metadata

What if instead, we wanted to convert all those 'T' values to nulls (or 'Nan', for 'Not a Number', which is a NumPy object of _nan_, which we can write as __np.nan__), instead of filtering those records out? Well, we could find all the values of 'T' in these columns, then set them to null. Let's start with the _precipitation_ column:

```python
weather.loc[weather['precipitation'] == 'T','precipitation'] = np.nan
weather.iloc[8]

## Output: ##
date                   9-1-2016
maximum temperature          47
minimum temperature          40
average temperature        43.5
precipitation              None
snow fall                   0.0
snow depth                    0
Name: 8, dtype: object
```

Now we can do the same with _snow depth_ and _snow fall_:

```python
weather.loc[weather['snow depth'] == 'T','snow depth'] = np.nan
weather.loc[weather['snow fall'] == 'T','snow fall'] = np.nan
```

Finally, it might make sense to change these data columns to numerical columns (using _pd.to_numeric( )_) so we can perform some aggregations on them:

```python
weather['precipitation'] = pd.to_numeric(weather['precipitation'])
weather['snow fall'] = pd.to_numeric(weather['snow fall'])
weather['snow depth'] = pd.to_numeric(weather['snow depth'])

weather.dtypes

## Output: ##
date                    object
maximum temperature      int64
minimum temperature      int64
average temperature    float64
precipitation          float64
snow fall              float64
snow depth             float64
dtype: object
```

Now when we _describe( )_ our changed DataFrame, we see our three fields pop up, although they have lower counts than the three original columns that were populated in this view:

``` python
weather.describe()

## Output: ##
       maximum temperature  minimum temperature  average temperature  precipitation   snow fall  snow depth
count           366.000000           366.000000           366.000000     342.000000  351.000000  359.000000
mean             64.625683            49.806011            57.215847       0.123304    0.102564    0.281337
std              18.041787            16.570747            17.124760       0.318830    1.472052    1.946624
min              15.000000            -1.000000             7.000000       0.000000    0.000000    0.000000
25%              50.000000            37.250000            44.000000       0.000000    0.000000    0.000000
50%              64.500000            48.000000            55.750000       0.000000    0.000000    0.000000
75%              81.000000            65.000000            73.500000       0.050000    0.000000    0.000000
max              96.000000            81.000000            88.500000       2.310000   27.300000   22.000000
```

### Joins

_pandas_ also helps us join multiple DataFrames together. Let's create a data frame for all our weather in December and another for all the weather in February. Then we can join these two data frames on __day__ to see which temperature was hotter on the first day of the month.

_(there's definitely better approaches to answering this question, but we can use this to demonstrate how joins work)_

First, let's convert our date column to a _date_ data type and then create new columns for the month, day, and year:

```python
weather['date_new'] = pd.to_datetime(weather['date'])
weather['month'] = weather['date_new'].dt.month
weather['day'] = weather['date_new'].dt.day
weather['year'] = weather['date_new'].dt.year
```

Now we should be able to create new DataFrames for January and February using these new columns as filters:

```python
jan = weather.loc[weather['month'] == 1]
feb = weather.loc[weather['month'] == 2]
```

Finally, we can join these two DataFrames together on day and see which month had a higher temperature on the first day of the year. I always use __[merge](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.merge.html)__ for my joins in pandas since I think it's the most flexible, but _join_ is another option as well that relies on indices _(NOTE: I didn't provide join logic here, so we default to a left join)_ :

```python
jan_feb = jan.merge(feb,on='day',suffixes=('_jan','_feb'))
jan_feb.loc[jan_feb['day']==1,('average temperature_jan','average temperature_feb')]

## Output: ##
   average temperature_jan  average temperature_feb
0                     38.0                     36.0
```

So it looks like the temperature on the first day in January was 2 degrees warmer than the first day in February!

## Other Useful Links

- [10 Minutes to Pandas](https://pandas.pydata.org/pandas-docs/stable/getting_started/10min.html) – beginners guide
- [10 Minute Tour of Pandas](https://vimeo.com/59324550) – video by the author
- [Comparison with SQL](https://pandas.pydata.org/pandas-docs/stable/getting_started/comparison/comparison_with_sql.html)
- [API Reference](https://pandas.pydata.org/pandas-docs/stable/reference/index.html)
