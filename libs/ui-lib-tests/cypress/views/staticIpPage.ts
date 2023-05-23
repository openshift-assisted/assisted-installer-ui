export const staticIpPage = {
  getFormViewSelect: () => {
    return cy.get('#select-form-view');
  },
  getYamlViewSelect: () => {
    return cy.get('#select-yaml-view');
  },
  getAddMoreHosts: () => {
    return cy.get('[data-testid="add-host"]');
  },
  networkWideDns: () => {
    return cy.get(`#form-input-dns-field`);
  },
  networkWideMachineNetwork: (ipVersion) => {
    return cy.get(`#form-input-ipConfigs-${ipVersion}-machineNetwork-ip-field`);
  },
  networkWideMachineNetworkPrefix: (ipVersion) => {
    return cy.get(`#form-input-ipConfigs-${ipVersion}-machineNetwork-prefixLength-field`);
  },
  networkWideMachineGateway: (ipVersion) => {
    return cy.get(`#form-input-ipConfigs-${ipVersion}-gateway-field`);
  },
  hostSpecificMacAddress: (hostIdx: number) => {
    return cy.get(`[data-testid="mac-address-${hostIdx}"]`);
  },
  hostSpecificIpv4Address: (hostIdx: number) => {
    return cy.get(`[data-testid="ipv4-address-${hostIdx}"]`);
  },
  dualStackNetworking: () => {
    return cy.get('#form-radio-protocolType-dualStack-field');
  },
  useVlan: () => {
    return cy.get('#form-checkbox-useVlan-field');
  },
  vlanField: () => {
    return cy.get('#form-input-vlanId-field');
  },
  hostMappingBlockToggle: (index: number) => {
    return cy.get(`[data-testid="toggle-host-${index}"]`);
  },
  hostMappingMacAddress: (index: number) => {
    return cy.get(`[data-testid="mac-address-${index}"]`);
  },
  hostMappingIpv4Address: (index: number) => {
    return cy.get(`[data-testid="ipv4-address-${index}"]`);
  },
  hostMappingIpv6Address: (index: number) => {
    return cy.get(`[data-testid="ipv6-address-${index}"]`);
  },
};
