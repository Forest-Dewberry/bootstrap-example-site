import logging
import json
import os
import azure.functions as func
from azure.cosmos import CosmosClient
from ..AuditLog import AuditLog 
from ..Sync import Sync 

logging.getLogger().setLevel(logging.DEBUG)
module = "org"
url = os.environ['ACCOUNT_URI']
key = os.environ['ACCOUNT_KEY']
dbname = os.environ['ACCOUNT_DBNAME']
client = CosmosClient(url, credential=key)

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

def createItem(container,read_item):
    if len(read_item.get("name"))>0:
        logging.info('Create Item')  
        container.create_item(body=read_item)
        audit.log(read_item["oid"],module,"ADD",None, read_item)
        sync.bump(read_item["oid"])
        return True
    else: return False  

def updateItem(container,item):    
    if len(item.get("name"))>0:
        logging.info('Add Item')  
        read_item = container.read_item(item['id'], item['oid'])

        for k in read_item:
          if k not in item:
              item[k]=read_item[k]
        
        item['oid']=read_item['oid'] # MAKE SURE THERE ARE NO ALTERATIONS
        item['id']=read_item['id']   # MAKE SURE THERE ARE NO ALTERATIONS
        container.upsert_item(body=item)

        audit.log(read_item["oid"],module,"UPDATE",read_item,item)
        sync.bump(item["oid"])
        return True
    else: return False

def deleteItem(container,oid,id):
    logging.info('Delete Item %s/%s',oid,id)
    read_item = container.read_item(id, oid)          
    container.delete_item(item=id, partition_key=oid)
    audit.log(oid,module,"DELETE",read_item,None)
    sync.bump(oid)        

def getItems(container):
    query = container.query_items(
        query= f'SELECT * FROM {module}',
        enable_cross_partition_query=True)
    items=[]

    for item in query:
        items.append(item)

    return items

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info(f'{module} service start')

    database = client.get_database_client(dbname)
    container = database.get_container_client(module)

    if req.method=="POST": #ADD
        # /api/org - ADD
        if createItem(container,req.get_json()):
            return respond(200,
            getItems(container))
        return respond(400,"Bad Request")

    if req.method=="GET":   #GET
        # /api/org/{id} - GET SINGLE ORG
        # NOT IMPLEMENTED
    
        # /api/org - LIST
        return respond(200,getItems(container))

    if req.method=="PUT":   #UPDATE
        # /api/org/{id} - UPDATE SINGLE ORG
        if updateItem(container,req.get_json()):
            return respond(200, getItems(container)   )
        return respond(400,"Bad Request")

    if req.method=="DELETE":   #UPDATE
        # /api/org/{id} - DELETE SINGLE ORG
        parts = req.url.split("/")
        id = parts[-1]
        oid = parts[-2]
        deleteItem(container,oid,id)
        return respond(200, getItems(container)
    )

    return respond(400,
        "bad request"
    )
