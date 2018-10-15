from logger.logger import set_up_logger
import pandas as pd
import numpy as np
file1 = open("data part1.txt",'r')
file2 = open("data part2.txt",'r')
result = file1.readlines()
result2 = file2.readlines()
result = [x.replace("\t"," ") for x in result]
result = [x.replace("\n"," ") for x in result]
result2 = [x.replace("\t"," ") for x in result2]
result2 = [x.replace("\n"," ") for x in result2]
column2 = []
for i in range(len(result)):
    column1 = []
    column1.append(result[i].split(" ")[0])
    column1.append(result[i].split(" ")[1])
    column1.append(result[i].split(" ")[2])
    column1.append(result[i].split(" ")[3])
    column2.append(column1)
df = pd.DataFrame(column2,columns = ['CUSTOMER_1_ID', 'CUSTOMER_2_ID', 'REALATIONSHIP_STRENGTH','RELATIONSHIP'])

column3 = []
for i in range(len(result)):
    column1 = []
    column1.append(result[i].split(" ")[0])
    column1.append(result[i].split(" ")[1])
    column1.append(result[i].split(" ")[2])
    column1.append(result[i].split(" ")[3])
    column3.append(column1)
df2 = pd.DataFrame(column3,columns = ['CUSTOMER_1_ID', 'CUSTOMER_2_ID', 'REALATIONSHIP_STRENGTH','RELATIONSHIP'])


csv_final = pd.concat([df,df2])
csv_final.to_csv('./data.csv',index = False)
