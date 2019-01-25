import pandas as pd
import numpy as np
from src.logger.logger import set_up_logger
import copy
import pymysql

__name__ = 'Node'
logger = set_up_logger(__name__)

USER = "root"
PASSWORD = "testing"
PORT = 3306
HOST = "127.0.0.1"
DB = "capstone"

def get_node_edge(customer_id,degree = 6):
    # connect to database
    try:
        client = pymysql.connect(user=USER, password=PASSWORD, port=PORT, host=HOST, db=DB, charset="utf8")
        cursor = client.cursor()
        logger.info('Successful connection to MySQL Database')
    except Exception as e:
        logger.error("Fail to connect MySQL Database")
        logger.error(e)
    # create a list to store nodes and links
    nodes, links = [], []
    # create a list to remove duplicate id
    remove_id = []
    # the customer id in current degree (i.e. now is 0)
    customer_id_in_degree = [customer_id]

    for i in range(degree+1):
        customer_id_in_next_degree = []
        logger.info('You are in degree {} to {}... Finding the relationship of Customer ID {}.'.format(i, i+1, customer_id_in_degree))

        # get the relationship that related to that customers
        tuple_degree = "(" + str(customer_id_in_degree).strip('[]') + ")"
        logger.info(tuple_degree)
        cursor.execute("SELECT * FROM CustomerRelationship WHERE customerID1 IN " + tuple_degree + " OR customerID2 IN " + tuple_degree)
        for relationship in cursor:
            source, target, weight, type = relationship
            if source in remove_id or target in remove_id:
                continue
            elif source in customer_id_in_degree and target in customer_id_in_degree:
                row = dict(source=source, target=target, weight=weight, type=type, group=i)
                links.append(row)
            # if it's not the last degree
            elif i < degree:
                row = dict(source=source, target=target, weight=weight, type=type, group=i+1)
                customer_id_in_next_degree.append(source)
                customer_id_in_next_degree.append(target)
                links.append(row)

        # get the info of current degree customer_list
        cursor.execute("SELECT * FROM CustomerInfo WHERE customerID IN " + tuple_degree)
        for customer in cursor:
            id, name, age, gender, address = customer
            row = dict(id=id, name=name, age=age, gender=gender, address=address, group=i)
            nodes.append(row)

        # remove the original customer id in the list
        customer_id_in_next_degree = list(set(customer_id_in_next_degree) - set(customer_id_in_degree) - set(list(remove_id)))
        # check if there are any customer id in next degree
        if not customer_id_in_next_degree:
            break
        else:
            # add remove id in the list
            remove_id += customer_id_in_degree
            # set the current degree to the next degree and continue
            customer_id_in_degree = customer_id_in_next_degree

    cursor.close()
    client.close()
    return nodes, links