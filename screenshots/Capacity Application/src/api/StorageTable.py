import logging
import os
import uuid
import json
from azure.data.tables import TableServiceClient, UpdateMode
from datetime import date,datetime,timedelta

from .AuditLog import AuditLog 
from .Sync import Sync 

class StorageTable:
    __table_service_client = None 

    tablePrefix = ""
    module = ""
    partitionKey = "oid"
    key = "id"

    __audit = None
    __sync = None
    
    def __init__(self, module, key="id"):
        logging.debug(f"Initialize StorageTable For {module}")
        self.__audit = AuditLog()
        self.__sync = Sync(module)

        self.key = key

        storage_conn = os.environ["AZURE_STORAGE_CONNECTION_STRING"]
        self.__table_service_client = TableServiceClient.from_connection_string(conn_str=storage_conn)
        self.module = module
        self.tablePrefix = module

    def tableName(self, oid):
        return f'{self.tablePrefix}-{oid}'.replace("-","")

    def add(self, item):
        if len(item.get("name"))>0:
            logging.info('Add %s',self.module)  
            
            item["PartitionKey"] = item[self.partitionKey]
            item["RowKey"] = item[self.key]

            table_client = self.__table_service_client.create_table_if_not_exists(table_name=self.tableName(item[self.partitionKey]))
            table_client.create_entity(item)

            self.__audit.log(item[self.partitionKey],self.module,"ADD",None, item)
            self.__sync.bump(item[self.partitionKey])
            return True
        else: return False  

    def update(self, item):    
        if len(item.get("name"))>0:
            logging.info('Update %s',self.module)  
            read_item = self.getById(item[self.partitionKey], item[self.key])

            item["PartitionKey"] = item[self.partitionKey]         # MAKE SURE THERE ARE NO ALTERATIONS
            item["RowKey"] = item[self.key]                      # MAKE SURE THERE ARE NO ALTERATIONS

            table_client = self.__table_service_client.create_table_if_not_exists(table_name=self.tableName(item[self.partitionKey]))
            table_client.upsert_entity(mode=UpdateMode.MERGE, entity=item)

            self.__audit.log(item[self.partitionKey], self.module,"UPDATE",read_item,item)
            self.__sync.bump(item[self.partitionKey])
            return True
        else: return False

    def delete(self, oid, id):
        logging.info('Delete %s - %s/%s',self.module,oid,id)
        read_item = self.getById(oid, id)          

        table_client = self.__table_service_client.get_table_client(table_name=self.tableName(oid))
        table_client.delete_entity(row_key=id, partition_key=oid)

        self.__audit.log(oid,self.module,"DELETE",read_item,None)
        self.__sync.bump(oid)

    def get(self, oid):
        logging.info('Get %s - %s',self.module,oid)
        
        table_client = self.__table_service_client.get_table_client(table_name=self.tableName(oid))
        entities = table_client.query_entities(f"PartitionKey eq '{oid}'",results_per_page=100)

        items = []
        for entity in entities:
            entity.pop('PartitionKey', None)
            entity.pop('RowKey', None)
            items.append(entity)

        return items

    def getById(self, oid, id):
        logging.info('GetById %s - %s/%s',self.module,oid,id)
        try:
            table_client = self.__table_service_client.get_table_client(table_name=self.tableName(oid))

            filter = f"PartitionKey eq '{oid}' and RowKey eq '{id}'"
            logging.debug(f"get by {filter}")
            entities = table_client.query_entities(filter,results_per_page=1)

            for entity in entities:
                entity.pop('PartitionKey', None)
                entity.pop('RowKey', None)
                return entity
        except:
            logging.warn("failed to get: %s,%s",oid,id)

        return None
