from flask import Flask, render_template, request, jsonify, make_response
from src.logger.logger import set_up_logger
from src.node_relationship.node import get_all_relationship
import pymysql, json, random
import pandas as pd

logger = set_up_logger()

app = Flask(__name__)

USER = "root"
PASSWORD = "testing"
PORT = 3306
HOST = "127.0.0.1"
DB = "capstone"

@app.route("/", methods=["GET", "POST"])
def initialize():
    customerID = None
    if request.method == "POST":
        customerID = request.form.get("customerID", None)
    if customerID:
        id = customerID
    else:
        id = random.randint(1, 297111)  #Problem: 170214, 112790

    csv_data = pd.read_csv('./data/data.csv')
    logger.info('Random Customer ID is {} '.format(id))
    customer_list = get_all_relationship(id, csv_data)
    logger.info('Customer Relationship is {} '.format(customer_list))
    testing = str(tuple(customer_list))
    logger.info('testing {}'.format(testing))

    try:
        client = pymysql.connect(user=USER, password=PASSWORD, port=PORT, host=HOST, db=DB, charset="utf8")
        cursor = client.cursor()
        logger.info('Successful connection to MySQL Database')
    except Exception as e:
        logger.error("Fail to connect MySQL Database")
        logger.error(e)

    #get the relationship of the customer and its related ppl
    cursor.execute("SELECT * FROM CustomerRelationship WHERE customerID1 IN " + testing + " OR customerID2 IN " + testing)
    links = []
    for relationship in cursor:
        row = dict(source=relationship[0], target=relationship[1],
            weight=relationship[2],type=relationship[3])
        links.append(row)

    #get all customers in the network
    cursor.execute("SELECT * FROM CustomerInfo WHERE customerID IN " + testing)
    nodes = []
    for customer in cursor:
        row = dict(id=customer[0], name=customer[1], group=customer[2])
        nodes.append(row)

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
