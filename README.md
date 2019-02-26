# RMBI-Capstone
Aims to visualize the relationship network of the specified customers.

Enter the database information in **config.yml** before you run the code.
----
## User define Function
1. (logger)[#logger]
2. (Mysql Connection)[#mysql-connection]
3. (Node-edge)[#node-edge]
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
-----
### Mysql Connection
MySQL is one of the world's most popular open source database that is supported by an active community of open source developers and enthusiasts.

For mysql connection:
```
from src.mysql.mysql_in_python import connect_to_mysql
cursor, client = connect_to_mysql(config)
```

For mysql (example) data insert:
```
from src.mysql.mysql_in_python import main
main()
```
------
### Node-edge
Node edge is a function which gets the network information of certain person in mysql database.

Can use Node-edge as **below**:
```
from src.node_relationship.node_edge import get_node_edge
nodes, links = get_node_edge(id, config)
```
