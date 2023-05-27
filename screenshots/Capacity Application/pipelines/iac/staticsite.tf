resource "azurerm_storage_account" "site_sa" {
  name                = replace("${var.tags.org}-${var.tags.app}", "-", "")
  resource_group_name = azurerm_resource_group.rg.name

  location                 = azurerm_resource_group.rg.location
  account_kind             = "StorageV2"
  account_tier             = "Standard"
  account_replication_type = "LRS"
  #enable_https_traffic_only = true

  /*static_website {
    index_document = "index.html"
  }*/

  /*network_rules {
    default_action             = "Deny"
    ip_rules                   = ["76.72.188.168"]
    virtual_network_subnet_ids = [azurerm_subnet.backend.id]
  }*/

  tags = {
    environment = "dev"
  }

  lifecycle {
    ignore_changes = [
      network_rules["default_action"] # ignore because taken care of by pipeline
    ]
  }
}

resource "azurerm_static_site" "site" {
  name                = "${var.tags.org}-${var.tags.app}-app"
  resource_group_name = azurerm_resource_group.rg.name
  location            = "centralus"

  sku_tier = "Standard"
  sku_size = "Standard"
}

/*
resource "azurerm_static_site_custom_domain" "domain" {
  static_site_id  = azurerm_static_site.site.id
  domain_name     = "cap.breakfreesolutions.com"
  validation_type = "cname-delegation"
}
*/
