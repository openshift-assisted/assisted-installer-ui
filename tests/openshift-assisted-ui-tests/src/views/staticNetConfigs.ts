import * as YAML from 'yaml';

export const staticNetConfigsPage = {
  enableYamlView: () => {
    cy.get(`.pf-c-radio__label:contains(${Cypress.env('yamlViewRadioText')})`)
      .scrollIntoView()
      .click({ force: true });
  },
  enableFormView: () => {
    cy.get(`.pf-c-radio__label:contains(${Cypress.env('formViewRadioText')})`)
      .scrollIntoView()
      .click({ force: true });
  },
  formView: {
    selectInternetProtocolVersion: (ipVersion = Cypress.env('ASSISTED_STATIC_IP_VERSION')) => {
      cy.get(Cypress.env('selectProtocolVersion')).select(ipVersion);
    },
    enableVlan: () => {
      cy.get(Cypress.env('useVlan')).check().should('be.checked');
    },
    disableVlan: () => {
      cy.get(Cypress.env('useVlan')).uncheck().should('be.unchecked');
    },
    inputVlanId: (vlanId = Cypress.env('ASSISTED_STATIC_IP_VLAN')) => {
      cy.get(Cypress.env('vlanId')).type(vlanId);
    },
    inputIpv4MachineNetwork: (ipv4MachineNetwork) => {
      cy.get(Cypress.env('ipv4MachineNetworkIp')).type(ipv4MachineNetwork);
    },
    inputIpv4MachineNetworkPrefixLength: (ipv4PrefixLength) => {
      cy.get(Cypress.env('ipv4MachineNetworkPrefixLength')).type(ipv4PrefixLength);
    },
    inputIpv4DefaultGateway: (ipv4DefaultGateway) => {
      cy.get(Cypress.env('ipv4Gatway')).type(ipv4DefaultGateway);
    },
    inputIpv4Dns: (ipv4Dns) => {
      cy.get(Cypress.env('ipv4Dns')).type(ipv4Dns);
    },
    inputIpv6MachineNetwork: (ipv6MachineNetwork) => {
      cy.get(Cypress.env('ipv6MachineNetworkIp')).type(ipv6MachineNetwork);
    },
    inputIpv6MachineNetworkPrefixLength: (ipv6PrefixLength) => {
      cy.get(Cypress.env('ipv6MachineNetworkPrefixLength')).type(ipv6PrefixLength);
    },
    inputIpv6DefaultGateway: (ipv6DefaultGateway) => {
      cy.get(Cypress.env('ipv6Gateway')).type(ipv6DefaultGateway);
    },
    inputIpv6Dns: (ipv6Dns) => {
      cy.get(Cypress.env('ipv6Dns')).type(ipv6Dns);
    },
    addHostsFormViewInterfaceMappings: () => {
      if (Cypress.env('MASTER_MAC_ADDRESSES')) {
        cy.wrap(Cypress.env('MASTER_MAC_ADDRESSES')).each((masterMac, index) => {
          cy.fixture(`${masterMac}.json`).then((masterMacMapping) => {
            // Interface mapping currently only contains one interface..
            // This might change in the future
            cy.get(`[data-testid=mac-address-${index}]`).scrollIntoView().type(masterMacMapping[0].mac_address);
            cy.fixture(`${masterMac}.yaml`).then((masterMacYaml) => {
              cy.get(`[data-testid=ipv4-address-${index}]`).type(
                YAML.parse(masterMacYaml)['interfaces'][0]['ipv4']['address'][0]['ip'],
              );
              if (Cypress.env('ASSISTED_STATIC_IP_VERSION') === 'dualstack') {
                cy.get(`[data-testid=ipv6-address-${index}]`).type(
                  YAML.parse(masterMacYaml)['interfaces'][0]['ipv6']['address'][0]['ip'],
                );
              }
            });
          });
          if (index < Cypress.env('NUM_MASTERS') - 1) {
            cy.get(Cypress.env('addHostDataTestId')).click();
          }
        });
      }
      if (Cypress.env('WORKER_MAC_ADDRESSES')) {
        cy.get(Cypress.env('addHostDataTestId')).click();
        cy.wrap(Cypress.env('WORKER_MAC_ADDRESSES')).each((workerMac, index) => {
          cy.fixture(`${workerMac}.json`).then((workerMacMapping) => {
            const macIndex = index + Number(Cypress.env('NUM_MASTERS'));
            // Interface mapping currently only contains one interface.. This might change in the future
            cy.get(`[data-testid=mac-address-${macIndex}]`).scrollIntoView().type(workerMacMapping[0].mac_address);
            cy.fixture(`${workerMac}.yaml`).then((workerMacYaml) => {
              cy.get(`[data-testid=ipv4-address-${macIndex}]`).type(
                YAML.parse(workerMacYaml)['interfaces'][0]['ipv4']['address'][0]['ip'],
              );
              if (Cypress.env('ASSISTED_STATIC_IP_VERSION') === 'dualstack') {
                cy.get(`[data-testid=ipv6-address-${macIndex}]`).type(
                  YAML.parse(workerMacYaml)['interfaces'][0]['ipv6']['address'][0]['ip'],
                );
              }
            });
          });
          if (index < Cypress.env('NUM_WORKERS') - 1) {
            cy.get(Cypress.env('addHostDataTestId')).click();
          }
        });
      }
    },
  },
  yamlView: {
    getStartFromScratch: () => {
      cy.get(`.pf-c-empty-state__secondary > .pf-c-button:contains(${Cypress.env('yamlStartFromScratchText')})`);
    },
    addHostsYamlAndInterfaceMappings: () => {
      if (Cypress.env('MASTER_MAC_ADDRESSES')) {
        cy.wrap(Cypress.env('MASTER_MAC_ADDRESSES')).each((masterMac, index) => {
          cy.get(Cypress.env('inputTypeFile')).attachFile(`${masterMac}.yaml`);
          cy.fixture(`${masterMac}.json`).then((masterMacMapping) => {
            // Interface mapping currently only contains one interface.. This might change in the future
            cy.get(`[data-testid=mac-address-${index}-0]`).scrollIntoView().type(masterMacMapping[0].mac_address);
            cy.get(`[data-testid=interface-name-${index}-0]`)
              .scrollIntoView()
              .type(masterMacMapping[0].logical_nic_name);
          });
          cy.get(Cypress.env('copyHostConfiguration')).uncheck();
          if (index < Cypress.env('NUM_MASTERS') - 1) {
            cy.get(Cypress.env('addHostDataTestId')).click();
          }
        });
      }
      if (Cypress.env('WORKER_MAC_ADDRESSES')) {
        cy.get(Cypress.env('addHostDataTestId')).click();
        cy.wrap(Cypress.env('WORKER_MAC_ADDRESSES')).each((workerMac, index) => {
          cy.get(Cypress.env('inputTypeFile')).attachFile(`${workerMac}.yaml`);
          cy.fixture(`${workerMac}.json`).then((workerMacMapping) => {
            const macIndex = index + Number(Cypress.env('NUM_MASTERS'));
            // Interface mapping currently only contains one interface. This might change in the future
            cy.get(`[data-testid=mac-address-${macIndex}-0]`).scrollIntoView().type(workerMacMapping[0].mac_address);
            cy.get(`[data-testid=interface-name-${macIndex}-0]`)
              .scrollIntoView()
              .type(workerMacMapping[0].logical_nic_name);
          });
          cy.get(Cypress.env('copyHostConfiguration')).uncheck();
          if (index < Cypress.env('NUM_WORKERS') - 1) {
            cy.get(Cypress.env('addHostDataTestId')).click();
          }
        });
      }
    },
  },
};
