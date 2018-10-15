import pandas as pd
import numpy as np

reading = pd.read_csv('./Data.csv')
reading.columns

reading['REALATIONSHIP_STRENGTH'].value_counts()
