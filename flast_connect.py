from flask import Flask, render_template, request
from logger.logger import set_up_logger
import json

app = Flask(__name__)

name = 'Flask_Connect'
logger = set_up_logger(name)

@app.route('/')
def index():
    # go to index page
    return render_template("index.html")

@app.route("/donorschoose/projects")
def donorschoose_projects():
    connection = MongoClient(MONGODB_HOST, MONGODB_PORT)
    collection = connection[DBS_NAME][COLLECTION_NAME]
    projects = collection.find(projection=FIELDS, limit=100000)
    #projects = collection.find(projection=FIELDS)
    json_projects = []
    for project in projects:
        json_projects.append(project)
    json_projects = json.dumps(json_projects, default=json_util.default)
    connection.close()
    return json_projects



@app.route('/', methods=['POST'])
def customerID_input():
    customerID = request.form['customerID']
    processed_text = customerID.upper()
    logger.debug(customerID)
    return render_template("index.html", text=processed_text)

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)
