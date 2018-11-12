from flask import Flask, render_template, request, jsonify
from src.logger.logger import set_up_logger
import pymysql, json

logger = set_up_logger()

app = Flask(__name__)

USER = "root"
PASSWORD = "testing"
PORT = 3306
HOST = "127.0.0.1"
DB = "capstone"

@app.route('/')
def index():
    """go to index page"""
    return render_template("index.html")

@app.route("/testing/allCustomers")
def get_all_relationship():
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


@app.route('/', methods=['POST'])
def customerID_input():
    customerID = request.form['customerID']
    processed_text = customerID.upper()
    logger.info(customerID)
    return render_template("index.html", text=processed_text)

if __name__ == '__main__':
    app.run(debug=True)
