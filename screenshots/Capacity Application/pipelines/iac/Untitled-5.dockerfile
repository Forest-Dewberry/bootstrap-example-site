az vm create \
    --resource-group learn-576556d0-da63-415d-b9a6-c42d207334aa \
    --name public \
    --vnet-name vnet \
    --subnet publicsubnet \
    --image UbuntuLTS \
    --admin-username azureuser \
    --no-wait \
    --custom-data cloud-init.txt \
    --admin-password uheiuDFSE8778__