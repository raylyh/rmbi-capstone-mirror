from flask import Flask, render_template, request
from src.logger.logger import set_up_logger
from src.node_relationship.node_edge import get_node_edge
import random
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
        customerID = request.form.get("customerID", None) # get the customer id from website
    if customerID:
        id = int(customerID) # change it to int type
    else:
        id = random.randint(1, 297111)  #randomly choose between 1 to 297111 to show a graph

    logger.info('customerID: {}'.format(id))
    nodes, links = get_node_edge(id, config)

    json_data = dict(nodes=nodes, links=links)

    # send the data to index.html
    return render_template("index.html", customerID=customerID, data=json_data)

if __name__ == '__main__':
    app.run(debug=True)
