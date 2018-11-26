import pymysql
from logger.logger import set_up_logger
import sys

##########################################
#       Connect to the database          #
##########################################
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

##########################################
#             Query in mysql             #
##########################################

result = cursor.execute('select count(*) from tableName').fetchall()
print(result)

##########################################
#          Create Table in mysql         #
##########################################

cursor.execute('CREATE TABLE pet (name VARCHAR(20), owner VARCHAR(20), species VARCHAR(20), sex CHAR(1), birth DATE, death DATE)')

##########################################
#          insert data in mysql          #
##########################################

sql = "INSERT INTO customers (name, address) VALUES (%s, %s)"
val = [
  ('Peter', 'Lowstreet 4'),
  ('Amy', 'Apple st 652'),
  ('Hannah', 'Mountain 21'),
  ('Michael', 'Valley 345'),
  ('Sandy', 'Ocean blvd 2'),
  ('Betty', 'Green Grass 1'),
  ('Richard', 'Sky st 331'),
  ('Susan', 'One way 98'),
  ('Vicky', 'Yellow Garden 2'),
  ('Ben', 'Park Lane 38'),
  ('William', 'Central st 954'),
  ('Chuck', 'Main Road 989'),
  ('Viola', 'Sideway 1633')
]

cursor.executemany(sql, val)
mysql.commit()
logger.info(cursor.rowcount, "was inserted.")
