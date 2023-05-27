import logging
import os
import uuid
import json
from azure.data.tables import TableServiceClient
from datetime import datetime,timedelta

class AuditLog:
    __table_service_client = None 

    tablePrefix = "log"

    def __init__(self):
        logging.debug("Initialize AuditLog")
        storage_conn = os.environ["AZURE_STORAGE_CONNECTION_STRING"]
        self.__table_service_client = TableServiceClient.from_connection_string(conn_str=storage_conn)

    def tableName(self, oid):
        return f'{self.tablePrefix}-{oid}'.replace("-","")

    def getItems(self, oid,fromDate = "",toDate = ""):
        table_client = self.__table_service_client.get_table_client(table_name=self.tableName(oid))

        if fromDate=="":
            fromDate=None
        if toDate=="":
            toDate=None

        filter=""
        if fromDate!=None:
            dte=fromDate.replace(tzinfo=None).isoformat() + 'Z'
            filter = f"Timestamp ge datetime'{dte}'"

        if toDate!=None:
            if filter!="":
                filter+=" and "
            dte=toDate.replace(tzinfo=None).isoformat() + 'Z'
            filter += f"Timestamp le datetime'{dte}'"

        if filter=="":
            dte=datetime.utcnow()+timedelta(days=-30)
            dte=dte.replace(tzinfo=None).isoformat() + 'Z'
            filter = f"Timestamp ge datetime'{dte}'"

        logging.debug(f"get by {filter}")
        entities = table_client.query_entities(filter,results_per_page=100)

        items=[]
        for entity in entities:
            items.append(entity)

        return items

    def changes(self, f, t):
        if f!=None and t!=None:
            items = [k for k in f if k in t and f[k] != t[k]]
            
            for k in f:
                if k not in t:
                    items.append(k)

            for k in t:
                if k not in f:
                    items.append(k)
                
            changes = []
            for k in items:
                changes.append({"Field":k,"From":f.get(k,'Null'),"To":t.get(k,'Null')})

            return {
                "Changes":changes,
                "Was":f,
                "Now":t
            }

        if f!=None and t==None:
            changes = []
            for k in f:
                changes.append({"Field":k,"From":f.get(k,'Null'),"To":None})

            return {
                "Changes":changes,
                "Was":f,
                "Now":t
            }
        
        if f==None and t!=None:
            changes = []
            for k in t:
                changes.append({"Field":k,"From":t.get(k,'Null'),"To":None})

            return {
                "Changes":changes,
                "Was":f,
                "Now":t
            }

        return {
                "Changes":[],
                "Was":f,
                "Now":t
            }

    def log(self, oid,module,action,fromObj,toObj):
        table_client = self.__table_service_client.create_table_if_not_exists(table_name=self.tableName(oid))

        item= {
            'PartitionKey': module,
            'RowKey': str(uuid.uuid4()),        
            'Action':action,
            'Changes':json.dumps(self.changes(fromObj,toObj))
        }
        return table_client.create_entity(entity=item)