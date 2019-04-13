from src.logger.logger import set_up_logger
from src.mysql.mysql_in_python import connect_to_mysql
import pymysql
import yaml

__name__ = 'Node'
logger = set_up_logger(__name__)

def get_node_edge(customer_id, config, degree=6):
    # connect to database
    cursor, client = connect_to_mysql(config)
    # create a list to store nodes and links
    nodes, links = [], []
    # create a list to remove duplicate id
    remove_id = []
    # the customer id in current degree (i.e. now is 0)
    customer_id_in_degree = [customer_id]

    for i in range(degree+1):
        logger.info("Degree {}: {}".format(i, customer_id_in_degree))
        customer_id_in_next_degree = []
        # get relationships of customers in current degree
        tuple_degree = "(" + str(customer_id_in_degree).strip('[]') + ")"
        cursor.execute("SELECT * FROM CustomerRelationship WHERE customerID1 IN " + tuple_degree + " OR customerID2 IN " + tuple_degree)
        # parse the retrieved relationships to 'links'
        for relationship in cursor:
            source, target, weight, type = relationship
            if source in remove_id or target in remove_id:
                continue
            # both customers are in the same degree
            elif source in customer_id_in_degree and target in customer_id_in_degree:
                row = dict(source=source, target=target, weight=weight, type=type, group=i)
                links.append(row)
            # both customers are not in the same degree and i is not at the last degree
            elif i < degree:
                row = dict(source=source, target=target, weight=weight, type=type, group=i+1)
                customer_id_in_next_degree.append(source)
                customer_id_in_next_degree.append(target)
                links.append(row)

        # get info of customers in current degree
        cursor.execute("SELECT * FROM CustomerInfo WHERE customerID IN " + tuple_degree)
        for customer in cursor:
            id, name, age, gender, address,smoking,education,health = customer
            row = dict(id=id, name=name, age=age, gender=gender, address=address, smoking = smoking, education = education, health = health, group=i)
            nodes.append(row)

        # remove the original customer id in the list
        customer_id_in_next_degree = list(set(customer_id_in_next_degree) - set(customer_id_in_degree) - set(list(remove_id)))
        # check if there are any customer id in next degree
        if not customer_id_in_next_degree:
            logger.info("Final degree: {}".format(i))
            break
        else:
            # add remove id in the list
            remove_id += customer_id_in_degree
            # set the current degree to the next degree and continue
            customer_id_in_degree = customer_id_in_next_degree

    logger.info('num_nodes: {} num_edges: {}'.format(len(nodes), len(links)))
    cursor.close()
    client.close()
    return nodes, links
