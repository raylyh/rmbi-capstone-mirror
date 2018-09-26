import logging
import os

def set_up_logger():
    # creates logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)

    # create a handler to remote
    console = logging.StreamHandler()
    console.setLevel(logging.DEBUG)

    # create a handler to file
    file_logging = logging.FileHandler(os.path.join(os.getcwd(), 'logger','output.log'))
    file_logging.setLevel(logging.DEBUG)

    # set the format to the handler
    formatter = logging.Formatter(fmt="%(asctime)s - %(filename)s - %(levelname)s - %(message)s",
                                      datefmt="%m/%d/%Y %H:%M:%S")
    console.setFormatter(formatter)
    file_logging.setFormatter(formatter)

    # add the handler to the logger
    logger.addHandler(console)
    logger.addHandler(file_logging)

    # return logger to the user
    return logger
