import pandas as pd
import numpy as np
from src.logger.logger import set_up_logger
import copy

__name__ = 'Node'
logger = set_up_logger(__name__)

# drop dupliate rows and values

def drop_duplicate(df):
    df_local = df.copy()
    df_local['CUSTOMER_1_ID_NEW'] =  df_local['CUSTOMER_2_ID']
    df_local['CUSTOMER_2_ID_NEW'] =  df_local['CUSTOMER_1_ID']
    df_match = df_local.query('CUSTOMER_1_ID == CUSTOMER_1_ID_NEW & CUSTOMER_2_ID == CUSTOMER_2_ID_NEW')
    print(df_match)

    return df_match

def node_relationship(customer_id,df,remove_id = None,degree = None):

    # to check whether customer_id is a list or not
    try:
        customer_id = list(customer_id)
    except:
        customer_id = [customer_id]

    logger.info('Finding the relationship of Customer ID {} from the data.'.format(customer_id))

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

    logger.info('Customer ID {} are found in degree {}'.format(list_of_customer,degree))
    return (list_of_customer)

def get_all_relationship(customer_id,df,degree = 6):
    # create a list to remove
    remove_id = []
    # create a list that obtain in all degree
    obtain_id = [customer_id]
    # the customer id in current degree (i.e. now is 0)
    customer_id_in_degree = [customer_id]
    for i in range(degree):
        logger.info('You are in degree {}'.format(i))
        logger.info('Already to get customer id in degree {}'.format(int(i + 1)))

        # use the current degree to get the next degree
        customer_id_in_next_degree = node_relationship(customer_id_in_degree,df,remove_id,int(i+1))

        # add remove id in the list
        remove_id +=customer_id_in_degree

        # add obtain customer id in the list
        obtain_id += customer_id_in_next_degree

        # check if there are any customer id in next degree
        if len(customer_id_in_next_degree) == 0:
            logger.warning('No customer ID can be found in degree {}'.format(int(i+1)))
            logger.info('Stop at degree {}'.format(int(i+1)))
            break
        else:
            # set the current degree to the next degree and continue
            customer_id_in_degree = customer_id_in_next_degree


    return obtain_id
