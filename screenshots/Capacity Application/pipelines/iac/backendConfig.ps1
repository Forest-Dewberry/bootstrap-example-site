param (
    $resourceGroupName,
    $location,
    $storageAccountName,
    $containerName
)

# Variables
$subscriptionId = "193b7438-23dd-41b3-931f-c28bae49eb87"
$resourceGroup = $resourceGroupName
$location = $location
$accountName = $storageAccountName
$containerName = $containerName

# Set Default Subscription
Select-AzSubscription -SubscriptionId $subscriptionId

# Create Resource Group
New-AzResourceGroup -Name $resourceGroup -Location $location -Force

# Create Storage Account
$storageAccount = Get-AzStorageAccount -Name $accountName -ResourceGroupName $resourceGroup -ErrorAction Ignore
if ($storageAccount -eq $null) {
    New-AzStorageAccount -ResourceGroupName $resourceGroup -Name $accountName -Location $location -SkuName Standard_LRS -Kind StorageV2
    $storageAccount = Get-AzStorageAccount -Name $accountName -ResourceGroupName $resourceGroup
}

# Get Storage Account Key
$storageKey = (Get-AzStorageAccountKey -ResourceGroupName $resourceGroup -Name $accountName).Value[0]

# Create Storage Container
$ctx = $storageAccount.Context
$container = Get-AzStorageContainer -Name $containerName -Context $ctx -ErrorAction Ignore
if ($container -eq $null) {
    New-AzStorageContainer -Name $containerName -Context $ctx -Permission blob
    $container = Get-AzStorageContainer -Name $containerName -Context $ctx
}

# Output
write-Host "##vso[task.setvariable variable=terraformresourcegroup]$resourceGroupName"
Write-Host "##vso[task.setvariable variable=terraformstorageaccount]$storageAccountName"
Write-Host "##vso[task.setvariable variable=terraformstoragecontainer]$containerName"