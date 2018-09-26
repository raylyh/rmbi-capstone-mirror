import pymysql
from logger.logger import set_up_logger
import sys
import pandas as pd
import numpy as np

logger = set_up_logger()
logger.info('Connecting to Mysql Database')
try:
    mysql = pymysql.connect(
      user="root",
      password="testing",
      port=3306,
      host="127.0.0.2",
      db="MYSQL",
      charset="utf8"
    )
    cursor = mysql.cursor()
    logger.info('Successful to connect Mysql Database')
except Exception as e:
    logger.error("Fail to connect Mysql Database")
    logger.error(e)
    sys.exit(-1)

try:
    cursor.execute("""CREATE TABLE customer_relation (Customer1_id_1 BIGINT, Customer2_id BIGINT, Closeness INT, Customer1_Relationship VARCHAR(20), Customer2_Relationship VARCHAR(20))""")
    cursor.execute("""CREATE TABLE customer_information (customer_id BIGINT, Age INT,Birthday Date, Gender VARCHAR(20),Address VARCHAR(100), City VARCHAR(20), Phone_Number INT, Occupation VARCHAR(20),Company VARCHAR(20),Height FLOAT, Weight FLOAT)""")
except:
    pass

#####################################################
# first table
#####################################################

insert_sql_1 = "INSERT INTO customer_relation (Customer1_id_1, Customer2_id,Closeness,Customer1_Relationship,Customer2_Relationship) VALUES (%s, %s, %s, %s, %s)"
val_1 = [
  (123,456,4,'父親','兒子'),
  (123,457,4,'父親','女兒'),
  (123,458,4,'父親','女兒')
]
cursor.executemany(insert_sql_1, val_1)
mysql.commit()

#####################################################
# second table
#####################################################

insert_sql_2 = """INSERT INTO customer_information
(Customer_id, Age, Birthday, Gender, Address,
City, Phone_Number, Occupation, Company, Height,
Weight)
VALUES (%s, %s, %s, %s, %s,
%s, %s, %s, %s, %s
%s)"""
val_2 = [
  (123, 60, 1960/1/1, '男', '城守东大街57号四川省第四人民医院口腔科',
  '成都市',13151484365, '其他铁路工程技术人员','东莞市宏图通风设备有限公司东莞市宏图通风', 185.3,
78),
  (456, 30, 1990/1/1, '男', '城守东大街57号四川省第四人民医院口腔科',
  '成都市',13151484365, '其他铁路工程技术人员','东莞市宏图通风设备有限公司东莞市宏图通风', 185.3,
78),
  (457, 20, 1998/3/1, '女', '城守东大街57号四川省第四人民医院口腔科',
  '成都市',13151484365, '其他铁路工程技术人员','东莞市宏图通风设备有限公司东莞市宏图通风', 185.3,
78),
  (458, 20, 1998/1/1, '女', '城守东大街57号四川省第四人民医院口腔科',
  '成都市',13151484365, '其他铁路工程技术人员','东莞市宏图通风设备有限公司东莞市宏图通风', 185.3,
78)
]
cursor.executemany(insert_sql_2, val_2)
mysql.commit()
