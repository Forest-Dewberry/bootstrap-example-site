param (
    $sourcePath,
    $resourceGroupName,
    $location,
    $storageAccountName
)

# Variables
$subscriptionId = "193b7438-23dd-41b3-931f-c28bae49eb87"
$location = $location

# Set Default Subscription
Select-AzSubscription -SubscriptionId $subscriptionId

$storageAccount = Get-AzStorageAccount -Name $storageAccountName -ResourceGroupName $resourceGroupName -ErrorAction Ignore
$ctx = $storageAccount.Context

$StartTime = Get-Date
$EndTime = $startTime.AddDays(1)

$creds = New-AzStorageAccountSASToken -Context $ctx -Service File -ResourceType Object -Permission rwdlc -ExpiryTime $EndTime
$dest="https://$storageAccountName.file.core.windows.net/functions/site/wwwroot/$creds"

#pip install -r ${sourcePath}requirements.txt -t ${sourcePath}.python_packages/lib/site-packages
azcopy sync $sourcePath $dest --recursive
