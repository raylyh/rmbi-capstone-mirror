import pandas as pd
import numpy as np
from src.logger.logger import set_up_logger
from src.node_relationship.node import get_all_relationship, drop_duplicate
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

drop_duplicate(reading)

len(set(reading.CUSTOMER_2_ID.values))

id_1 = list(set(reading.CUSTOMER_2_ID.values))
end_degree = []
for i in range(len(id_1)):
    customer_list,end = get_all_relationship(id_1[i],reading)
    end_degree.append(end)
    if i % int(round(len(id_1)/20)) == 0:
        print(i)


len(end_degree)



plt.hist(end_degree, bins = 6)
plt.xlabel('Max Degree')
plt.ylabel('No of Customer')
plt.title('Max Degree of Customer')

customer_list_2 = get_all_relationship(73,reading)
len(customer_list_2)


pd.DataFrame(end_degree).to_csv('temp4.csv',index = False)

import pickle
with open("test.txt", "wb") as fp:
    pickle.dump(end_degree, fp)

from collections import Counter
Counter(end_degree)

from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/hi')
def hello_world_hi():
    return 'Hello World! ABC'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)
