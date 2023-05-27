import logging
import json
import os
import azure.functions as func
from ..AuditLog import AuditLog 
from ..Sync import Sync 
from ..StorageTable import StorageTable 

logging.getLogger().setLevel(logging.DEBUG)

module = "holiday"
table = StorageTable(module,"rid")
audit = AuditLog()
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

    if req.method=="POST": #ADD
        # /api/org - ADD
        item=req.get_json()
        if len(item.get("name"))>0:
            table.update(item)
            return respond(200,table.get(item["oid"]))
                    
        return respond(400,"Bad Request")


    if req.method=="GET":   #GET
        parts = req.url.split("/")
        id = parts[-1]
        oid = parts[-2]
        if oid==module:
            oid=id
            id=None        
        
        # /api/org/{id} - GET SINGLE ORG
        if id!=None and len(oid)>0:
            return respond(200,table.getById(oid,id))
    
        # /api/org - LIST
        if oid!=None and len(oid)>0:
            return respond(200,table.get(oid))
        
        return respond(400,"Bad Request")

    if req.method=="PUT":   #UPDATE
        # /api/org/{id} - UPDATE SINGLE ORG
        item=req.get_json()
        if len(item.get("name"))>0:
            table.update(item)
            return respond(200,table.get(item["oid"]))
        return respond(400,"Bad Request")

    if req.method=="DELETE":   #UPDATE
        # /api/org/{id} - DELETE SINGLE ORG
        parts = req.url.split("/")
        id = parts[-1]
        oid = parts[-2]
        table.delete(oid,id)
        return respond(200,table.get(item["oid"]))

    return respond(400,
        "bad request"
    )
