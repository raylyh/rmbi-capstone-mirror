from logger.logger import set_up_logger
import pandas as pd
import numpy as np

def save_to_df(file_name):
    file_name = str(file_name)
    file = open(file_name,'r')
    result = file.readlines()
    result = [x.replace("\t"," ") for x in result]
    result = [x.replace("\n"," ") for x in result]
    out_put_column = []
    for i in range(len(result)):
        column1 = []
        column1.append(result[i].split(" ")[0])
        column1.append(result[i].split(" ")[1])
        column1.append(result[i].split(" ")[2])
        column1.append(result[i].split(" ")[3])
        out_put_column.append(column1)
    df = pd.DataFrame(out_put_column,columns = ['CUSTOMER_1_ID', 'CUSTOMER_2_ID', 'RELATIONSHIP_STRENGTH','RELATIONSHIP'])
    return df
df = save_to_df('data part1.txt')
df2 = save_to_df('data part2.txt')
csv_final = pd.concat([df,df2])
csv_final.to_csv('./data.csv',index = False)
