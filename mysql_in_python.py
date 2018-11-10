import pymysql, sys, random, names
import numpy as np
import pandas as pd
from logger.logger import set_up_logger

logger = set_up_logger()

def main():
    ##########################################
    #       Connect to the database          #
    ##########################################
    logger.info('Connecting to MySQL Database...')
    try:
        client = pymysql.connect(
          user="root",
          password="testing",
          port=3306,
          host="127.0.0.1",
          db="capstone",
          charset="utf8"
        )
        cursor = client.cursor()
        logger.info('Successful connection to MySQL Database')
    except Exception as e:
        logger.error("Fail to connect MySQL Database")
        logger.error(e)
        sys.exit(-1)

    while True:
        print("""
    ##########################################
    #                 Options                #
    #       1. Create Table in MySQL         #
    #       2. Insert Data into Tables       #
    #       0. exit                          #
    ##########################################
        """)
        option = input("Please select an option: ")

        if option == "0" or option == "exit":
            cursor.close()
            client.close()
            break
        elif option == "1":
            createTable(cursor)
        elif option == "2":
            insertData(cursor, client)
        else:
            logger.warning("Incorrect option.")
            continue


def createTable(cursor):
    print("""
    ##########################################
    #          Create Table in MySQL         #
    #       1. Show existing Tables          #
    #       2. Create CustomerInfo           #
    #       3. Create CustomerRelationship   #
    ##########################################
    """)
    option = input("Please select an option: ")

    if option == "1":
        cursor.execute("SHOW TABLES")
        for (i,) in cursor.fetchall():
            logger.info(i)
            cursor.execute("SHOW COLUMNS FROM " + i)
            for column in cursor.fetchall():
                print("{} , type {}".format(column[0], column[1]))
        logger.info("Success")
    elif option == "2":
        try:
            cursor.execute("""CREATE TABLE CustomerInfo (
                customerID BIGINT, name VARCHAR(100), age INT, gender VARCHAR(20), Address VARCHAR(200),
                primary key (customerID))""")
            logger.info("Success")
        except Exception as e:
            logger.error(e)
    elif option == "3":
        try:
            cursor.execute("""CREATE TABLE CustomerRelationship (
                customerID1 BIGINT, customerID2 BIGINT, weight INT, type INT,
                foreign key (customerID1) references CustomerInfo(customerID),
                foreign key (customerID2) references CustomerInfo(customerID))""")
            logger.info("Success")
        except Exception as e:
            logger.error(e)
    return


def insertData(cursor, client):
    print("""
    ##########################################
    #          Insert Data into Tables       #
    #       1. Insert CustomerInfo           #
    #       2. Insert CustomerRelationship   #
    ##########################################
    """)

    option = input("Please select an option: ")

    if option == "1":
        sql = "INSERT INTO CustomerInfo (customerID, name, age, gender, address) VALUES (%s, %s, %s, %s, %s)"
        #customerID is in range of [1, 297111]
        #tuple: (customerID, name, age, gender, address)
        val = [(i,
            names.get_full_name(),
            random.randint(18,80),
            random.choice(['M','F']),
            "address"+str(i)) for i in range(1, 297112)]
        logger.info("Finish generating random info")
        try:
            cursor.executemany(sql, val)
            client.commit()
            logger.info("Inserted rows:")
            logger.info(cursor.rowcount)
        except Exception as e:
            logger.error(e)

    elif option == "2":
        with open("data/data.csv") as f:
            table = pd.read_csv(f, delimiter=',')

        sql = "INSERT INTO CustomerRelationship (customerID1, customerID2, weight, type) VALUES (%s, %s, %s, %s)"
        #tuple: (customerID1, customerID2, weight, type)
        val = list(table.itertuples(index=False, name=None))
        try:
            cursor.executemany(sql, val)
            client.commit()
            logger.info("Inserted rows:")
            logger.info(cursor.rowcount)
        except Exception as e:
            logger.error(e)
        return

main()
