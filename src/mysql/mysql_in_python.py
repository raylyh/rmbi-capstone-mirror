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
            CustomerID BIGINT, Name VARCHAR(100), Age INT, Gender VARCHAR(20), Address VARCHAR(200), SmokingStatus VARCHAR(100), Education VARCHAR(100), Health VARCHAR(100), Link VARCHAR(200),
            primary key (CustomerID))""")
        logger.info("Success in creating CustomerInfo Table")
    except Exception as e:
        logger.error("Problem in CustomerInfo Table - {}".format(e))
    try:
        # cursor execute a sql comment
        cursor.execute("""CREATE TABLE CustomerRelationship (
            customerID1 BIGINT, customerID2 BIGINT, weight INT, type INT,
            foreign key (customerID1) references CustomerInfo(customerID),
            foreign key (customerID2) references CustomerInfo(customerID))""")
        logger.info("Success in creating CustomerRelationship Table")
    except Exception as e:
        logger.error("Problem in CustomerRelationship Table - {}".format(e))


def insertData(cursor, client):
    sql = "INSERT INTO CustomerInfo (CustomerID, Name, Age, Gender, Address, SmokingStatus, Education, Health, Link) VALUES (%s, %s, %s, %s, %s,%s, %s, %s, %s)"
    #customerID is in range of [1, 297111]
    #tuple: (CustomerID, Name, Age, Gender, Address, Smoking, Education, Health, Link)

    val = [(
        i,      #CustomerID
        names.get_full_name(),      #Name
        random.randint(18,80),      #Age
        random.choice(['M','F']),   #Gender
        random.choice(['Yuen Long','Sha Tin','Tai Po','Sham Shui Po','Sai Kung','Southern',
        'Yau Tsim Mong','Wan Chai','Eastern','Wong Tai Sin','Kwun Tong',
        'Kwai Tsing','North','Kowloon City','Tuen Mun','Tsuen Wan','Islands']),     #Address
        random.choice(['Smoker','Non Smoker']),             #Smoking
        random.choice(['Primary','Secondary','Tertiary']),  #Education
        random.choice(['Normal','Hypertension','Cancer','Diabetes']),   #Health
        random.choice(['yahoo.com', 'facebook.com', 'google.com'])     #Link
        ) for i in range(1, 297112)]
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
