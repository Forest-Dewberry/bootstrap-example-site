# https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/manage-with-terraform
# main.tf

resource "azurerm_cosmosdb_account" "cosmos" {
  name                      = var.cosmosdb_account_name
  location                  = var.cosmosdb_account_location
  resource_group_name       = azurerm_resource_group.rg.name
  offer_type                = "Standard"
  kind                      = "GlobalDocumentDB"
  enable_automatic_failover = false
  enable_free_tier          = true
  geo_location {
    location          = var.location
    failover_priority = 0
  }
  consistency_policy {
    consistency_level       = "BoundedStaleness"
    max_interval_in_seconds = 300
    max_staleness_prefix    = 100000
  }

}

resource "azurerm_cosmosdb_sql_database" "main" {
  name                = var.cosmosdb_sqldb_name
  resource_group_name = azurerm_resource_group.rg.name
  account_name        = azurerm_cosmosdb_account.cosmos.name
  autoscale_settings {
    max_throughput = var.max_throughput
  }
}

resource "azurerm_cosmosdb_sql_container" "cosmos_org" {
  name                  = "org"
  resource_group_name   = azurerm_resource_group.rg.name
  account_name          = azurerm_cosmosdb_account.cosmos.name
  database_name         = azurerm_cosmosdb_sql_database.main.name
  partition_key_path    = "/oid"
  partition_key_version = 1
  autoscale_settings {
    max_throughput = var.max_throughput
  }

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    included_path {
      path = "/included/?"
    }

    excluded_path {
      path = "/excluded/?"
    }
  }
}

resource "azurerm_cosmosdb_sql_container" "cosmos_member" {
  name                  = "member"
  resource_group_name   = azurerm_resource_group.rg.name
  account_name          = azurerm_cosmosdb_account.cosmos.name
  database_name         = azurerm_cosmosdb_sql_database.main.name
  partition_key_path    = "/oid"
  partition_key_version = 1
  autoscale_settings {
    max_throughput = var.max_throughput
  }

  indexing_policy {
    indexing_mode = "consistent"

    included_path {
      path = "/*"
    }

    included_path {
      path = "/included/?"
    }

    excluded_path {
      path = "/excluded/?"
    }
  }
}


resource "random_pet" "prefix" {
  prefix = var.prefix
  length = 1
}

output "cosmosdb_account_info" {
  value = {
    name = azurerm_cosmosdb_account.cosmos.name
    id1  = azurerm_cosmosdb_account.cosmos.id
    id2  = azurerm_cosmosdb_account.cosmos.endpoint
    id3  = azurerm_cosmosdb_account.cosmos.read_endpoints
    id4  = azurerm_cosmosdb_account.cosmos.write_endpoints
  }
}
