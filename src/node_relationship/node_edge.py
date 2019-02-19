import pandas as pd
import numpy as np
from src.logger.logger import set_up_logger
import copy
import pymysql
import yaml

__name__ = 'Node'
logger = set_up_logger(__name__)

f = open('./config.yml')
config = yaml.load(f)

USER = config['USER']
PASSWORD = config['PASSWORD']
PORT = config['PORT']
HOST = config['HOST']
DB = config['DB']

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


def node_relationship(customer_id,df,remove_id = None,degree = None):

    # to check whether customer_id is a list or not
    try:
        customer_id = list(customer_id)
    except:
        customer_id = [customer_id]

    # logger.info('Finding the relationship of Customer ID {} from the data.'.format(customer_id))

    # to get the relationship that related to that customers
    df = df[(df['CUSTOMER_1_ID'].isin(customer_id)) | (df['CUSTOMER_2_ID'].isin(customer_id))]

    # transfer the customer_id into list
    list_of_customer = df[['CUSTOMER_1_ID','CUSTOMER_2_ID']].values.tolist()

    # 2d list to 1d list
    list_of_customer = [i for sub in list_of_customer for i in sub]

    # remove the original customer id in the list
    if remove_id is None:
        list_of_customer = list(set(list_of_customer) - set(customer_id))
    else:
        try:
            remove_id = list(remove_id)
        except:
            remove_id = [remove_id]
        list_of_customer = list(set(list_of_customer) - set(customer_id) - set(list(remove_id)))

    # logger.info('Customer ID {} are found in degree {}'.format(list_of_customer,degree))
    return list_of_customer


def get_all_relationship(customer_id,df,degree = 6):
    # ensure the input value is a int
    customer_id = int(customer_id)
    # create a list to remove
    remove_id = []
    # create a list that obtain in all degree
    obtain_id = []
    obtain_id.append([customer_id])
    # the customer id in current degree (i.e. now is 0)
    customer_id_in_degree = [customer_id]
    end_degree = None
    for i in range(degree):
        # logger.info('You are in degree {}'.format(i))
        # logger.info('Already to get customer id in degree {}'.format(int(i + 1)))

        # use the current degree to get the next degree
        customer_id_in_next_degree = node_relationship(customer_id_in_degree,df,remove_id,int(i+1))

        # add remove id in the list
        remove_id +=customer_id_in_degree

        # check if there are any customer id in next degree
        if len(customer_id_in_next_degree) == 0:
            # logger.warning('No customer ID can be found in degree {}'.format(int(i+1)))
            # logger.info('Stop at degree {}'.format(int(i+1)))
            end_degree = int(i)
            break
        else:
            # set the current degree to the next degree and continue
            customer_id_in_degree = customer_id_in_next_degree

            # add obtain customer id in the list
            obtain_id.append(customer_id_in_next_degree)

    return obtain_id
