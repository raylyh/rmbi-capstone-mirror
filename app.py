from flask import Flask, render_template, request, jsonify, make_response
from src.logger.logger import set_up_logger
from src.node_relationship.node_edge import get_node_edge
import pymysql, json, random
import pandas as pd
import yaml

__name__ = '__main__'
logger = set_up_logger(__name__)

app = Flask(__name__)

f = open('./config.yml')
config = yaml.load(f)

@app.route("/", methods=["GET", "POST"])
def initialize():
    customerID = None
    if request.method == "POST":
        customerID = request.form.get("customerID", None)
    if customerID:
        id = int(customerID)
    else:
        id = random.randint(1, 297111)  #Problem: 170214, 112790, 234

    nodes, links = get_node_edge(id, config)

    logger.info('edges {}'.format(len(links)))
    logger.info('nodes {}'.format(len(nodes)))
    json_data = dict(nodes=nodes, links=links)
    logger.info("Success.")
    return render_template("index.html", customerID=customerID, data=json_data)

if __name__ == '__main__':
    app.run(debug=True)
