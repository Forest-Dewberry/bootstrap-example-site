import logging
import os
import uuid
import json
from azure.data.tables import TableServiceClient, UpdateMode
from datetime import date,datetime,timedelta

class Sync:
    __table_service_client = None 

    tablePrefix = "sync"
    module = ""

    def __init__(self, module):
        logging.debug("Initialize Sync")
        storage_conn = os.environ["AZURE_STORAGE_CONNECTION_STRING"]
        self.__table_service_client = TableServiceClient.from_connection_string(conn_str=storage_conn)
        self.module = module

    def tableName(self, oid):
        return f'{self.tablePrefix}-{oid}'.replace("-","")

    def get(self, oid):
        table_client = self.__table_service_client.create_table_if_not_exists(table_name=self.tableName(oid))

        logging.debug(f"get by {filter}")
        entities = table_client.query_entities(f"PartitionKey eq '{oid}'",results_per_page=100)

        sync={}
        for entity in entities:
            sync[entity["RowKey"]]=entity["TS"]

        return sync

    def bump(self,oid):
        table_client = self.__table_service_client.create_table_if_not_exists(table_name=self.tableName(oid))

        curr_dt = datetime.utcnow()

        item= {
            'PartitionKey': oid,
            'RowKey': self.module,        
            'TS':curr_dt.timestamp()
        }
        
        return table_client.upsert_entity(mode=UpdateMode.REPLACE, entity=item)