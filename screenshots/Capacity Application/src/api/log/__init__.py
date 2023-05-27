import logging
import json
import azure.functions as func
from ..AuditLog import AuditLog 

from datetime import datetime

logging.getLogger().setLevel(logging.DEBUG)
module = "log"

audit = AuditLog()

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

    # if req.method=="POST": #ADD
    #     # /api/org - ADD
    #     if createItem(container,req.get_json()):
    #         return respond(200,
    #         getItems(container))
    #     return respond(400,"Bad Request")

    my_entity = {
        u'Some': 'RedMarker',
        u'Stock': 15,
        u'Price': 9.99,
        u'Comments': u"great product",
        u'OnSale': True,
        u'ReducedPrice': 7.99,
        u'PurchaseDate': str(datetime(1973, 10, 4))
    }
    audit.log("00000000-0000-0000-0000-000000000000","JUNK","ADD",my_entity,None)
    return respond(200,audit.getItems("00000000-0000-0000-0000-000000000000"))
    
    #return respond(400,
        #"bad request"
    #)
