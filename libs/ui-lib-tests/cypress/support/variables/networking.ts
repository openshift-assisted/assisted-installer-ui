// Networking
Cypress.expose('userManagedFieldRadioId', '#form-radio-managedNetworkingType-userManaged-field');
Cypress.expose('clusterManagedFieldRadioId', '#form-radio-managedNetworkingType-clusterManaged-field');
Cypress.expose('vipDhcpAllocationFieldId', '#form-checkbox-vipDhcpAllocation-field');
Cypress.expose('useAdvancednetworkingId', '#useAdvancedNetworking');
Cypress.expose('hostRowDataTestIdPrefix', 'host-row-');
Cypress.expose('nicNameDataTestId', 'nic-name');
Cypress.expose('shareDiscoverySshKeyFieldId', '#form-checkbox-shareDiscoverySshKey-field');
Cypress.expose('inputSshPublicKeyFieldId', '#form-input-sshPublicKey-field');
Cypress.expose('networkingVmsAlert', 'networking-vms-alert');
Cypress.expose('vipAutoAllocSupportLevel', `[data-testid=VIP_AUTO_ALLOC-support-level]`);
Cypress.expose('nicStatus', `[data-testid=host-status]`);
Cypress.expose('apiVipFieldHelperId', '#form-input-apiVip-field-helper');
Cypress.expose('clusterNetworkCidrFieldHelperId', '#form-input-clusterNetworks-0-cidr-field-helper');
Cypress.expose(
  'clusterNetworkHostPrefixFieldHelperId',
  '#form-input-clusterNetworks-0-hostPrefix-field-helper',
);
Cypress.expose('serviceNetworkCidrFieldHelperId', '#form-input-serviceNetworks-0-cidr-field-helper');
Cypress.expose('userManagedNetworkingRadioText', 'User-managed networking');
Cypress.expose('openVirtualNetworkingRadioText', 'Open Virtual Networking');
Cypress.expose('networkTypeToggleId', '#form-input-networkType-field');
Cypress.expose('hostSubnetFieldId', '#form-input-hostSubnet-field');
Cypress.expose('clusterNetworkCidrFieldId', '#form-input-clusterNetworks-0-cidr-field');
Cypress.expose('clusterNetworks0HostPrefixFieldId', '#form-input-clusterNetworks-0-hostPrefix-field');
Cypress.expose('serviceNetworks0CidrFieldId', '#form-input-serviceNetworks-0-cidr-field');
Cypress.expose('vipsFieldHelperRequiredMessage', 'The value is required');

// Static IP
Cypress.expose('yamlViewRadioText', 'YAML view');
Cypress.expose('formViewRadioText', 'Form view');
Cypress.expose('selectProtocolVersion', `[data-testid=select-protocol-version]`);
Cypress.expose('useVlan', `[data-testid=use-vlan]`);
Cypress.expose('vlanId', `[data-testid=vlan-id]`);
Cypress.expose('ipv4MachineNetworkIp', `[data-testid=ipv4-machine-network-ip]`);
Cypress.expose('ipv4MachineNetworkPrefixLength', `[data-testid=ipv4-machine-network-prefix-length]`);
Cypress.expose('ipv4Gatway', `[data-testid=ipv4-gateway]`);
Cypress.expose('ipv4Dns', `[data-testid=ipv4-dns]`);
Cypress.expose('ipv6MachineNetworkIp', `[data-testid=ipv6-machine-network-ip]`);
Cypress.expose('ipv6MachineNetworkPrefixLength', `[data-testid=ipv6-machine-network-prefix-length]`);
Cypress.expose('ipv6Gateway', `[data-testid=ipv6-gateway]`);
Cypress.expose('ipv6Dns', `[data-testid=ipv6-dns]`);
Cypress.expose('addHostDataTestId', `[data-testid=add-host]`);
Cypress.expose('yamlStartFromScratchText', 'Start from scratch');
Cypress.expose('copyHostConfiguration', `[data-testid=copy-host-cofiguration]`);
