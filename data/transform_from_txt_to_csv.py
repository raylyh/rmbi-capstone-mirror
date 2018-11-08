from logger.logger import set_up_logger
import pandas as pd
import numpy as np
import time
import os

def save_to_df(file_name):
    file_name = str(file_name)
    file = open(file_name,'r')
    logger.info('Opened File')
    result = file.readlines()
    result = [x.replace("\t"," ") for x in result]
    result = [x.replace("\n"," ") for x in result]
    out_put_column = []
    logger.info('Start spliting the data')
    start_time = time.time()
    for i in range(len(result)):
        column1 = []
        column1.append(result[i].split(" ")[0])
        column1.append(result[i].split(" ")[1])
        column1.append(result[i].split(" ")[2])
        column1.append(result[i].split(" ")[3])
        out_put_column.append(column1)
    end_time = time.time()
    logger.info('Finish in {}s'.format(end_time - start_time))
    df = pd.DataFrame(out_put_column,columns = ['CUSTOMER_1_ID', 'CUSTOMER_2_ID', 'RELATIONSHIP_STRENGTH','RELATIONSHIP'])
    return df

__name__ = 'data_transformation'
logger = set_up_logger(__name__)
file_name_1 = 'data part1.txt'
file_path_1 = os.path.join(os.getcwd(), 'data',file_name_1)
logger.info('Start reading {}'.format(file_name_1))
df_1 = save_to_df(file_path_1)
file_name_2 = 'data part2.txt'
file_path_2 = os.path.join(os.getcwd(), 'data',file_name_2)
logger.info('Start reading {}'.format(file_name_2))
df_2 = save_to_df(file_path_2)
df_concat = pd.concat([df_1,df_2])
output_path = os.path.join(os.getcwd(), 'data', 'data.csv')
df_concat.to_csv(output_path,index = False)
logger.info('Output file in {}'.format(output_path))
