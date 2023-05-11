// Networking
Cypress.env('userManagedFieldRadioId', '#form-radio-managedNetworkingType-userManaged-field');
Cypress.env('clusterManagedFieldRadioId', '#form-radio-managedNetworkingType-clusterManaged-field');
Cypress.env('vipDhcpAllocationFieldId', '#form-checkbox-vipDhcpAllocation-field');
Cypress.env('useAdvancednetworkingId', '#useAdvancedNetworking');
Cypress.env('hostRowDataTestIdPrefix', 'host-row-');
Cypress.env('nicNameDataTestId', 'nic-name');
Cypress.env('shareDiscoverySshKeyFieldId', '#form-checkbox-shareDiscoverySshKey-field');
Cypress.env('inputSshPublicKeyFieldId', '#form-input-sshPublicKey-field');
Cypress.env('networkingVmsAlert', 'networking-vms-alert');
Cypress.env('vipAutoAllocSupportLevel', `[data-testid=VIP_AUTO_ALLOC-support-level]`);
Cypress.env('apiVipFieldId', '#form-input-apiVip-field');
Cypress.env('ingressVipFieldId', '#form-input-ingressVip-field');
Cypress.env('nicStatus', `[data-testid=nic-status]`);
Cypress.env('apiVipFieldHelperId', '#form-input-apiVip-field-helper');
Cypress.env('clusterNetworkCidrFieldHelperId', '#form-input-clusterNetworks-0-cidr-field-helper');
Cypress.env(
  'clusterNetworkHostPrefixFieldHelperId',
  '#form-input-clusterNetworks-0-hostPrefix-field-helper',
);
Cypress.env('serviceNetworkCidrFieldHelperId', '#form-input-serviceNetworks-0-cidr-field-helper');
Cypress.env('userManagedNetworkingRadioText', 'User-Managed Networking');
Cypress.env('openVirtualNetworkingRadioText', 'Open Virtual Networking');
Cypress.env('openshiftSdnInputValue', 'input[value="OpenShiftSDN"]');
Cypress.env('ovnKubernetesRadioId', `#form-radio-networkType-OVNKubernetes-field`);
Cypress.env('hostSubnetFieldId', '#form-input-hostSubnet-field');
Cypress.env('clusterNetworkCidrFieldId', '#form-input-clusterNetworks-0-cidr-field');
Cypress.env('clusterNetworks0HostPrefixFieldId', '#form-input-clusterNetworks-0-hostPrefix-field');
Cypress.env('serviceNetworks0CidrFieldId', '#form-input-serviceNetworks-0-cidr-field');
Cypress.env('vipsFieldHelperRequiredMessage', 'The value is required');

// Static IP
Cypress.env('yamlViewRadioText', 'YAML view');
Cypress.env('formViewRadioText', 'Form view');
Cypress.env('selectProtocolVersion', `[data-testid=select-protocol-version]`);
Cypress.env('useVlan', `[data-testid=use-vlan]`);
Cypress.env('vlanId', `[data-testid=vlan-id]`);
Cypress.env('ipv4MachineNetworkIp', `[data-testid=ipv4-machine-network-ip]`);
Cypress.env('ipv4MachineNetworkPrefixLength', `[data-testid=ipv4-machine-network-prefix-length]`);
Cypress.env('ipv4Gatway', `[data-testid=ipv4-gateway]`);
Cypress.env('ipv4Dns', `[data-testid=ipv4-dns]`);
Cypress.env('ipv6MachineNetworkIp', `[data-testid=ipv6-machine-network-ip]`);
Cypress.env('ipv6MachineNetworkPrefixLength', `[data-testid=ipv6-machine-network-prefix-length]`);
Cypress.env('ipv6Gateway', `[data-testid=ipv6-gateway]`);
Cypress.env('ipv6Dns', `[data-testid=ipv6-dns]`);
Cypress.env('addHostDataTestId', `[data-testid=add-host]`);
Cypress.env('yamlStartFromScratchText', 'Start from scratch');
Cypress.env('copyHostConfiguration', `[data-testid=copy-host-cofiguration]`);
