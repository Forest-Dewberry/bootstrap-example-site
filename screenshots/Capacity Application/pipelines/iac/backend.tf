terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.44.0"
    }
    azapi = {
      source  = "Azure/azapi"
      version = "~> 1.4.0"
    }
  }
  backend "azurerm" {
    resource_group_name  = var.REMOTE_RG
    storage_account_name = var.REMOTE_SA
    container_name       = var.REMOTE_CR
    key                  = "terraform.tfstate"
  }
}

provider "azurerm" {
  features {}
}