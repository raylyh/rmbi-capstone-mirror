import pandas as pd
import numpy as np
from src.logger.logger import set_up_logger
from src.node_relationship.node import get_all_relationship
import seaborn as sns
import matplotlib.pyplot as plt

__name__ = 'Development'
logger = set_up_logger(__name__)

reading = pd.read_csv('./data/data.csv')

int(len(reading.CUSTOMER_1_ID.value_counts())/4)

reading.CUSTOMER_1_ID.value_counts().reset_index().iloc[74277]
reading.CUSTOMER_1_ID.value_counts()
reading.columns
reading.value_counts()
plt.xlabel('Occurrence')
plt.ylabel('No of Customer')
plt.title('Occurrence of Customer')

len(set(reading.CUSTOMER_2_ID.values))

id_1 = list(set(reading.CUSTOMER_2_ID.values))
rows_data = []

for i in range(len(id_1)):
    row_data = []
    customer,end_degree,length,obtain_list = get_all_relationship(id_1[i],reading)
    row_data.append(customer)
    row_data.append(end_degree)
    row_data.append(length)
    row_data.append(obtain_list)
    rows_data.append(row_data)
    if i % int(round(len(id_1)/20)) == 0:
            print(i)

df_test = pd.DataFrame(rows_data,columns = ['CUSTOMER_ID','END_DEGREE','NODE_SIZE','NODE'])
df_test.to_csv('analysis_result.csv',index = False)
