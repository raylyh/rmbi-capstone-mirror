import pymysql
from logger.logger import set_up_logger
import sys

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
        option = input("Please select an option:")

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
    option = input("Please select an option:")

    if option == "1":
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        for i in tables:
            print(i)
        logger.info("Success")
    elif option == "2":
        try:
            cursor.execute("""CREATE TABLE CustomerInfo (
                customerID BIGINT, age INT, Gender VARCHAR(20), Address VARCHAR(200),
                primary key (customerID))""")
            logger.info("Success")
        except Exception as e:
            logger.error(e)
    elif option == "3":
        try:
            cursor.execute("""CREATE TABLE CustomerRelationship (
                customerID1 BIGINT, customerID2 BIGINT, weight INT, relationship1 VARCHAR(200), relationship2 VARCHAR(200),
                foreign key (customerID1) references CustomerInfo(customerID),
                foreign key (customerID2) references CustomerInfo(customerID))""")
            logger.info("Success")
        except Exception as e:
            logger.error(e)
    return

"""

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
client.commit()
logger.info(cursor.rowcount, "was inserted.")
"""

main()
