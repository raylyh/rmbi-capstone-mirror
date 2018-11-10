from flask import Flask, render_template, request
from logger.logger import set_up_logger
import json

logger = set_up_logger()

app = Flask(__name__)

@app.route('/')
def index():
    """go to index page"""
    return render_template("index.html")

@app.route('/', methods=['POST'])
def customerID_input():
    customerID = request.form['customerID']
    processed_text = customerID.upper()
    logger.debug(customerID)
    return render_template("index.html", text=processed_text)

if __name__ == '__main__':
    app.run(debug=True)
