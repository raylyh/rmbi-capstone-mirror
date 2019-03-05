# RMBI-Capstone
This project aims to visualize the relationship network of customer clusters in a website using **D3.js**.
A specific customer can be searched and its ego-network is visualized correspondingly.

Enter the database information in **config.yml** before you run the code.

**Format of config.yml**
```
USER : "your_username"
PASSWORD : "your_password"
PORT : 3306
HOST : "127.0.0.1"
DB : "your_database"
```

## Contents
1. [MySQL Database Schema](#mysql-database-schema)
2. [User-defined Function](#user-defined-function)
3. [Network Visualization Website](#network-visualization-website)

----

## MySQL Database Schema
The database containing the relationship data should have the following tables and their corresponding schema.

**If you want to set up the testing database and tables from scratch, please see** [MySQL Connection](#mysql-connection)
```
+----------------------+
| Tables               |
+----------------------+
| CustomerInfo         |
| CustomerRelationship |
+----------------------+

CustomerInfo
+------------+--------------+------+-----+---------+-------+
| Field      | Type         | Null | Key | Default | Extra |
+------------+--------------+------+-----+---------+-------+
| customerID | bigint(20)   | NO   | PRI | NULL    |       |
| name       | varchar(100) | YES  |     | NULL    |       |
| age        | int(11)      | YES  |     | NULL    |       |
| gender     | varchar(20)  | YES  |     | NULL    |       |
| Address    | varchar(200) | YES  |     | NULL    |       |
+------------+--------------+------+-----+---------+-------+
Note: CustomerInfo can have more fields/columns describing the customer.
The attributes here are for illustration purposes.

CustomerRelationship
+-------------+------------+------+-----+---------+-------+
| Field       | Type       | Null | Key | Default | Extra |
+-------------+------------+------+-----+---------+-------+
| customerID1 | bigint(20) | YES  | MUL | NULL    |       |
| customerID2 | bigint(20) | YES  | MUL | NULL    |       |
| weight      | int(11)    | YES  |     | NULL    |       |
| type        | int(11)    | YES  |     | NULL    |       |
+-------------+------------+------+-----+---------+-------+
```
[back](#contents)

----
## User-defined Function
1. [logger](#logger)
2. [MySQL Connection](#mysql-connection)
3. [node-edge](#node-edge)

[back](#contents)

-----
### logger
Logging is a means of tracking events that happen when some software runs. The software’s developer adds logging calls to their code to indicate that certain events have occurred. An event is described by a descriptive message which can optionally contain variable data (i.e. data that is potentially different for each occurrence of the event). Events also have an importance which the developer ascribes to the event; the importance can also be called the level or severity.

Can use logging as **below**:
```
from src.logger.logger import set_up_logger

logger = set_up_logger()

logger.info('Message')

logger.error('Message')

logger.debug('Message')

logger.warning('Message')

logger.critical('Message')
```
[back](#user-defined-function)

-----
### MySQL Connection
MySQL is one of the world's most popular open source database that is supported by an active community of open source developers and enthusiasts.

####For MySQL connection:
```
from src.mysql.mysql_in_python import connect_to_mysql
cursor, client = connect_to_mysql(config)
```

####For MySQL table creation and data insertion from scratch:
```
from src.mysql.mysql_in_python import main
main()
```
[back](#user-defined-function)

------
### Node-edge
Node-edge is a function which gets the network information of certain person in MySQL database.

Can use Node-edge as **below**:
```
from src.node_relationship.node_edge import get_node_edge
nodes, links = get_node_edge(id, config)
#id: customerID, config: database configuration retrieved from config.yml
```
[back](#user-defined-function)

----

## Network visualization Website
1. [Python-Flask](#python-flask)
2. [D3.js](#d3.js)
3. [HTML](#html)
4. [JavaScript](#javascript)
5. [CSS](#css)

[back](#contents)

-----
### Python-Flask



[back](#network-visualization-website)

-----
### D3.js
D3.js is a JavaScript library for manipulating documents based on data. D3 helps you bring data to life using HTML, SVG, and CSS. D3’s emphasis on web standards gives you the full capabilities of modern browsers without tying yourself to a proprietary framework, combining powerful visualization components and a data-driven approach to DOM manipulation.

In this project, the latest release is used in the HTML.
```
<script src="https://d3js.org/d3.v5.min.js"></script>
```

> The core of the visualization is used with this JavaScript Libarary in
> simple_network.js
>

[back](#network-visualization-website)

-----
### HTML



[back](#network-visualization-website)

------
### JavaScript



[back](#network-visualization-website)

-----
### CSS



[back](#network-visualization-website)

-----
