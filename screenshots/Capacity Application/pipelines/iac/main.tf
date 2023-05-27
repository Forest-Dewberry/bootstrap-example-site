data "azurerm_client_config" "current" {}

resource "azurerm_resource_group" "rg" {
  name     = "${var.tags.org}-${var.tags.app}-rg"
  location = "centralus"
}

resource "azurerm_service_plan" "core" {
  name                = "${var.tags.org}-${var.tags.app}-sp"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "B1"

  tags = var.tags
}

