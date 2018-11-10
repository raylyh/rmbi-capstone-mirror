import pandas as pd
import numpy as np
from src.logger.logger import set_up_logger
from src.node_relationship.node import get_all_relationship



__name__ = 'Development'
logger = set_up_logger(__name__)

reading = pd.read_csv('./data/data.csv')

reading.columns

set(reading.RELATIONSHIP.values)

customer_list = get_all_relationship(190,reading)
customer_list_2 = get_all_relationship(73,reading)
len(customer_list_2)



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
