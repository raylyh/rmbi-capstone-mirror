import pandas as pd
import numpy as np
from lo

reading = pd.read_csv('./data/data.csv')
reading.columns
len(reading)

len(set(reading.CUSTOMER_1_ID))
reading['RELATIONSHIP_STRENGTH'].value_counts()



reading['CUSTOMER_1_ID'].value_counts().reset_index()

def getting_relationship(customer_id,df):
    try
