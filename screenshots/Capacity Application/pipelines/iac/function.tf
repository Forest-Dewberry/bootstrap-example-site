locals {
  function_name = "org"
}

resource "azurerm_linux_function_app" "core" {
  name                = "${var.tags.org}-${var.tags.app}-api"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  storage_account_name       = azurerm_storage_account.site_sa.name
  storage_account_access_key = azurerm_storage_account.site_sa.primary_access_key
  service_plan_id            = azurerm_service_plan.core.id

  #virtual_network_subnet_id = azurerm_subnet.backend.id

  site_config {
    application_insights_connection_string = azurerm_application_insights.application_insights.connection_string

    application_stack {
      python_version = "3.9"
    }

    cors {
      allowed_origins     = ["https://localhost:3030"]
      support_credentials = true
    }
  }

  identity {
    type = "SystemAssigned"
  }

  /*
    auth_settings {
      enabled                       = true
      token_refresh_extension_hours = 0
      unauthenticated_client_action = "AllowAnonymous"
    }
  */

  app_settings = {
    ACCOUNT_URI                              = azurerm_cosmosdb_account.cosmos.endpoint
    ACCOUNT_KEY                              = azurerm_cosmosdb_account.cosmos.primary_key
    ACCOUNT_DBNAME                           = azurerm_cosmosdb_sql_database.main.name
    AZURE_STORAGE_CONNECTION_STRING          = azurerm_storage_account.site_sa.primary_connection_string    
    SCM_DO_BUILD_DURING_DEPLOYMENT           = true
    ENABLE_ORYX_BUILD                        = true
    WEBSITES_ENABLE_APP_SERVICE_STORAGE      = true
    WEBSITE_ENABLE_SYNC_UPDATE_SITE          = true
  }

  tags = var.tags
}

resource "azapi_resource" "linktofunction" {
  type      = "Microsoft.Web/staticSites/linkedBackends@2022-03-01"
  name      = "swalinktofunction"
  parent_id = azurerm_static_site.site.id
  body = jsonencode({
    properties = {
      region            = azurerm_static_site.site.location
      backendResourceId = azurerm_linux_function_app.core.id
    }
  })
}

resource "azurerm_application_insights" "application_insights" {
  name                = "${var.tags.org}-${var.tags.app}-${local.function_name}-insights"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"
}
