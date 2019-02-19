import pymysql, random, names
import pandas as pd
from src.logger.logger import set_up_logger
import yaml

logger = set_up_logger()

def connect_to_mysql(config):
    user = config['USER']
    password = config['PASSWORD']
    port = config['PORT']
    host = config['HOST']
    db = config['DB']

    logger.info('Connecting to MySQL Database')

    try:
        client = pymysql.connect(
          user=user,
          password=password,
          port=port,
          host=host,
          db=db,
          charset="utf8"
        )
        cursor = client.cursor()
        logger.info('Successful connection to MySQL Database')
    except Exception as e:
        logger.error("Fail to connect MySQL Database")
        raise ValueError("Please check your config file first")

    return cursor, client

def createTable(cursor):
    try:
        cursor.execute("""CREATE TABLE CustomerInfo (
            customerID BIGINT, name VARCHAR(100), age INT, gender VARCHAR(20), Address VARCHAR(200),
            primary key (customerID))""")
        logger.info("Success in creating CustomerInfo Table")
    except:
        logger.info("CustomerInfo Table already exist")

    try:
        cursor.execute("""CREATE TABLE CustomerRelationship (
            customerID1 BIGINT, customerID2 BIGINT, weight INT, type INT,
            foreign key (customerID1) references CustomerInfo(customerID),
            foreign key (customerID2) references CustomerInfo(customerID))""")
        logger.info("Success in creating CustomerRelationship Table")
    except:
        logger.info("CustomerRelationship Table already exist")

def insertData(cursor, client):

    sql = "INSERT INTO CustomerInfo (customerID, name, age, gender, address) VALUES (%s, %s, %s, %s, %s)"
    #customerID is in range of [1, 297111]
    #tuple: (customerID, name, age, gender, address)
    val = [(i,
        names.get_full_name(),
        random.randint(18,80),
        random.choice(['M','F']),
        "address"+str(i)) for i in range(1, 297112)]
    logger.info("Finish generating random customer info")
    try:
        cursor.executemany(sql, val)
        client.commit()
        logger.info("Inserted rows:")
        logger.info(cursor.rowcount)
    except Exception as e:
        logger.error(e)

    table = pd.read_csv("data/data.csv", delimiter=',')
    sql = "INSERT INTO CustomerRelationship (customerID1, customerID2, weight, type) VALUES (%s, %s, %s, %s)"
    #tuple: (customerID1, customerID2, weight, type)
    val = list(table.itertuples(index=False, name=None))
    try:
        cursor.executemany(sql, val)
        client.commit()
        logger.info("Inserted rows:")
        logger.info(cursor.r="root"owcount)
    except Exception as e:
        logger.error(e)

    return

def main():
    f = open('./config.yml')
    config = yaml.load(f)

    cursor, client = connect_to_mysql(config)
    createTable(cursor)
    insertData(cursor, client)
