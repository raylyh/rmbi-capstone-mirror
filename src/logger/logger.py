import logging
import os

def set_up_logger(__name__ = None):
    """Function to create logger

    Logger is use to indicate errors in function. It is very useful in development.

    Args:
        name (str): the name of program that you are running

    Returns:
        a logger with two formatted handler -- one is saving log file in local, another one is showing output in comment line

    """
    # creates logger
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.DEBUG)

    # create a handler to remote
    console = logging.StreamHandler()
    console.setLevel(logging.DEBUG)

    # create a handler to file
    file_logging = logging.FileHandler(os.path.join(os.getcwd(),'src', 'logger','output.log'))
    file_logging.setLevel(logging.DEBUG)

    # set the format to the handler
    formatter = logging.Formatter(fmt="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                                      datefmt="%m/%d/%Y %H:%M:%S")
    console.setFormatter(formatter)
    file_logging.setFormatter(formatter)

    # add the handler to the logger
    logger.addHandler(console)
    logger.addHandler(file_logging)

    # return logger to the user
    return logger
