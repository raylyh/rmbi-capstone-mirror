from src.logger.logger import set_up_logger
from src.mysql.mysql_in_python import connect_to_mysql
import pymysql
import yaml
from geopy.geocoders import Nominatim

__name__ = 'Node'
logger = set_up_logger(__name__)

def get_node_edge(customer_id, config, degree=6):
    """Function to get all relationship in 6 degree

    Logger is use to indicate errors in function. It is very useful in development.

    Args:
        customer_id (int): the id of a customer
        config (dict): the information of mysql
        degree (int): the max number of degree that user looking for

    Returns:
        two lists containing the information of nodes and links

    Example:
        [{'source': 1, 'target': 81216, 'weight': 4, 'type': 4, 'group': 1},
         {'source': 81216, 'target': 1, 'weight': 4, 'type': 24, 'group': 1},
         {'source': 81216, 'target': 95808, 'weight': 4, 'type': 24, 'group': 2},
         {'source': 81216, 'target': 95202, 'weight': 4, 'type': 25, 'group': 2},
         {'source': 81216, 'target': 81230, 'weight': 4, 'type': 14, 'group': 2},
         {'source': 95808, 'target': 81216, 'weight': 4, 'type': 4, 'group': 2},
         {'source': 81230, 'target': 81216, 'weight': 4, 'type': 2, 'group': 2},
         {'source': 95202, 'target': 81216, 'weight': 4, 'type': 10, 'group': 2}]
    """
    # connect to database
    cursor, client = connect_to_mysql(config)
    # create a list to store nodes and links
    nodes, links = [], []
    # create a list to remove duplicate id
    remove_id = []
    # the customer id in current degree (i.e. now is 0)
    customer_id_in_degree = [customer_id]
    # get the latitude and longitude of customer address
    geolocator = Nominatim(user_agent="google")

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
            id, name, age, gender, address, smoking, education, health, link = customer
            location = geolocator.geocode(address)
            latitude, longitude = location.latitude, location.longitude
            row = dict(id=id, name=name, age=age, gender=gender, address=address,latitude = latitude,longitude=longitude, smoking=smoking, education=education, health=health, link=link, group=i)
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
