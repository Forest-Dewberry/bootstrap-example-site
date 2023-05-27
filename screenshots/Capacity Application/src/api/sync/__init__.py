import logging
import json
import azure.functions as func
from ..Sync import Sync 

module = "sync"
logging.getLogger().setLevel(logging.DEBUG)

sync = Sync(module)

def respond(status,item):
    logging.info(f'{module} service end')
    return func.HttpResponse(
        json.dumps(item),
        status_code=status,
        mimetype = 'application/json',
        charset = 'utf-8'
    )

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info(f'{module} service start')

    parts = req.url.split("/")
    oid = parts[-1]
    
    try:
        
        return respond(200,sync.get(oid))
    except:
        logging.warn("failed to download: %s.json",oid)

    return respond(404,"No sync records")
