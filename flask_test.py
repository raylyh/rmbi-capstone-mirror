from flask import Flask, render_template, request, jsonify, make_response
from src.logger.logger import *
from src.node_relationship.node_edge import *
from src.mysql.mysql_in_python import *
import pymysql, json, random
import pandas as pd
import yaml

logger = set_up_logger('flask_test')

app = Flask(__name__)

f = open('./config.yml')
config = yaml.load(f)

USER = config['USER']
PASSWORD = config['PASSWORD']
PORT = config['PORT']
HOST = config['HOST']
DB = config['DB']

@app.route("/", methods=["GET", "POST"])
def initialize():
    customerID = None
    if request.method == "POST":
        customerID = request.form.get("customerID", None)
    if customerID:
        id = int(customerID)
    else:
        id = random.randint(1, 297111)  #Problem: 170214, 112790, 234

    nodes, links = get_node_edge(id)

    csv_data = pd.read_csv('./data/data.csv')
    logger.info('Random Customer ID is {} '.format(id))
    customer_list = get_all_relationship(id, csv_data)
    logger.info(customer_list)
    tuple_list = [str(sublist).replace("[", "(").replace("]", ")") for sublist in customer_list]
    logger.info('tuple_list {}'.format(tuple_list))
    flat_list = [i for sublist in customer_list for i in sublist]
    logger.info(flat_list)

    try:
        client = pymysql.connect(user=USER, password=PASSWORD, port=PORT, host=HOST, db=DB, charset="utf8")
        cursor = client.cursor()
        logger.info('Successful connection to MySQL Database')
    except Exception as e:
        logger.error("Fail to connect MySQL Database")
        logger.error(e)

    links, nodes = [], []
    for idx, i in enumerate(tuple_list):
        #get all customers in the network
        cursor.execute("SELECT * FROM CustomerInfo WHERE customerID IN " + i)
        for customer in cursor:
            #TODO:
            row = dict(id=customer[0], name=customer[1], group=idx, age=customer[2])
            nodes.append(row)

        #get the relationship of the customer and its related ppl
        cursor.execute("SELECT * FROM CustomerRelationship WHERE customerID1 IN " + i + " OR customerID2 IN " + i)
        for relationship in cursor:
            #problem: some relationships out of bound for last degree of customers
            #solution: check if it's in the flat_list
            if idx == 6:
                pass
            row = dict(source=relationship[0], target=relationship[1],
                weight=relationship[2], type=relationship[3], group=idx)
            links.append(row)

    cursor.close()
    client.close()

    logger.info('edges {}'.format(len(links)))
    logger.info('nodes {}'.format(len(nodes)))
    json_data = dict(nodes=nodes, links=links)
    logger.info("Success.")
    #return jsonify(json_data)
    return render_template("index.html", customerID=customerID, data=json_data)


@app.route("/testing/allCustomers")
def testing2():
    try:
        client = pymysql.connect(user=USER, password=PASSWORD, port=PORT, host=HOST, db=DB, charset="utf8")
        cursor = client.cursor()
        logger.info('Successful connection to MySQL Database')
    except Exception as e:
        logger.error("Fail to connect MySQL Database")
        logger.error(e)


    #get all relationship
    cursor.execute("SELECT * FROM CustomerRelationship")
    links = []
    for relationship in cursor:
        row = dict(source=relationship[0], target=relationship[1],
            weight=relationship[2],type=relationship[3])
        links.append(row)

    #get all customers
    cursor.execute("SELECT * FROM CustomerInfo")
    nodes = []
    for customer in cursor:
        row = dict(id=customer[0], name=customer[1], group=customer[2])
        nodes.append(row)

    cursor.close()
    client.close()

    logger.info(len(links))
    logger.info(len(nodes))
    json_data = dict(nodes=nodes, links=links)
    logger.info("Success.")
    return jsonify(json_data)


if __name__ == '__main__':
    app.run(debug=True)
