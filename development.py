from flask import Flask, render_template, request, jsonify, make_response
from src.logger.logger import *
from src.node_relationship.node_edge import *
from src.mysql.mysql_in_python import *
import pymysql, json, random
import pandas as pd
import numpy as np
import yaml

f = open('./config.yml')
config = yaml.load(f)

USER = config['USER']
PASSWORD = config['PASSWORD']
PORT = config['PORT']
HOST = config['HOST']
DB = config['DB']
