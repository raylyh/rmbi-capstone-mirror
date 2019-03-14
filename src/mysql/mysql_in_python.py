from src.logger.logger import set_up_logger
import pymysql, random, names
import pandas as pd
import yaml

__name__ = "MySQL-In-Python"
logger = set_up_logger(__name__)

def connect_to_mysql(config):
    """Function to connect mysql database

    Args:
        config (dict): the information of mysql

    Returns:
        client and cursor for mysql

    """
    try:
        # connect Mysql database using the config file
        client = pymysql.connect(
          user=config['USER'],
          password=config['PASSWORD'],
          port=config['PORT'],
          host=config['HOST'],
          db=config['DB'],
          charset="utf8"
        )
        cursor = client.cursor()
        logger.info('Successful connection to MySQL Database')
    except Exception as e:
        # to locate the error in connecting Mysql database
        logger.error("Failed to connect to MySQL Database - {}".format(e))
        raise ValueError("Please check your config file first")

    # return cursor and client
    return cursor, client


def createTable(cursor):
    """Function to create temp table in MySQL

    Schema in mysql database is not provided. We create some example tables as our customer relationship management database.

    Args:
        cursor: mysql cursor

    """

    try:
        # cursor execute a sql comment
        cursor.execute("""CREATE TABLE CustomerInfo (
            customerID BIGINT, name VARCHAR(100), age INT, gender VARCHAR(20), Address VARCHAR(200),
            primary key (customerID))""")
        logger.info("Success in creating CustomerInfo Table")
    except Exception as e:
        logger.error("CustomerInfo Table already exist - {}".format(e))
    try:
        # cursor execute a sql comment
        cursor.execute("""CREATE TABLE CustomerRelationship (
            customerID1 BIGINT, customerID2 BIGINT, weight INT, type INT,
            foreign key (customerID1) references CustomerInfo(customerID),
            foreign key (customerID2) references CustomerInfo(customerID))""")
        logger.info("Success in creating CustomerRelationship Table")
    except Exception as e:
        logger.error("CustomerRelationship Table already exist - {}".format(e))


def insertData(cursor, client):
    """Function to create temp data in MySQL

    Customer data in mysql database is not provided. We create some example data in our customer relationship management database.

    Args:
        cursor: mysql cursor
        client: mysql client
    """

    sql = "INSERT INTO CustomerInfo (customerID, name, age, gender, address) VALUES (%s, %s, %s, %s, %s)"
    #customerID is in range of [1, 297111]
    #tuple: (customerID, name, age, gender, address)

    # random initialize the customer information
    val = [(i,
        names.get_full_name(),
        random.randint(18,80),
        random.choice(['M','F']),
        "address"+str(i)) for i in range(1, 297112)]
    logger.info("Finish generating random customer info")
    try:
        cursor.executemany(sql, val)
        # commit the changers to database, otherwise the inserted data will not really save in mysql database
        client.commit()
        logger.info("Inserted CustomerInfo rows: {}".format(cursor.rowcount))
    except Exception as e:
        logger.error(e)

    table = pd.read_csv("data/data.csv", delimiter=',')
    sql = "INSERT INTO CustomerRelationship (customerID1, customerID2, weight, type) VALUES (%s, %s, %s, %s)"
    #tuple: (customerID1, customerID2, weight, type)
    val = list(table.itertuples(index=False, name=None))
    try:
        cursor.executemany(sql, val)
        # commit the changers to database, otherwise the inserted data will not really save in mysql database
        client.commit()
        logger.info("Inserted CustomerRelationship rows: {}".format(cursor.rowcount))
    except Exception as e:
        logger.error(e)


def main():
    f = open('./config.yml')
    config = yaml.load(f)

    cursor, client = connect_to_mysql(config)
    createTable(cursor)
    insertData(cursor, client)
    logger.info("Finish setting up the database")
