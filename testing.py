from logger.logger import set_up_logger
text = '測試'
dict = {'測試' : 'testing'}
logger = set_up_logger()
print(dict[text])
logger.info('success')
