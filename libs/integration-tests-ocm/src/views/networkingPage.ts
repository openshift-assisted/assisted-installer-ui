export const networkingPage = {
  getUserManagedNetworking: () => {
    return cy.get(Cypress.env('userManagedFieldRadioId'));
  },
  getClusterManagedNetworking: () => {
    return cy.get(Cypress.env('clusterManagedFieldRadioId'));
  },
  getVipDhcp: () => cy.get(Cypress.env('vipDhcpAllocationFieldId')),
  getAdvancedNetwork: () => cy.get(Cypress.env('useAdvancednetworkingId')),
  getStackTypeSingleStack: () => {
    return cy.get('#form-radio-stackType-singleStack-field');
  },
  getStackTypeDualStack: () => {
    return cy.get('#form-radio-stackType-dualStack-field');
  },
  getStackTypeInput: () => {
    return cy.get('input[name="stackType"]');
  },
  setClusterSubnetCidr: () => {
    cy.get(Cypress.env('hostSubnetFieldId'))
      .contains('/')
      .then((element) => {
        const text = element.text();
        cy.get(Cypress.env('hostSubnetFieldId')).select(text);
      });
  },
  setClusterSubnetCidrIpv6: () => {
    cy.get('#form-input-machineNetworks-1-cidr-field')
      .contains(':')
      .then((element) => {
        const text = element.text();
        cy.get('#form-input-machineNetworks-1-cidr-field').select(text);
      });
  },
  setHostInterfaceName: (idx) => {
    // host rows increment by 2
    cy.newByDataTestId(`${Cypress.env('hostRowDataTestIdPrefix')}${idx}`).within(() => {
      cy.newByDataTestId(Cypress.env('nicNameDataTestId')).then((nicName) => {
        const interfaceName = nicName.text();
        cy.log(`Interface Name: ${interfaceName}`);
        Cypress.env(`interfaceName`, interfaceName);
      });
    });
  },
  getShareSshKeyInput: () => {
    return cy.get(Cypress.env('shareDiscoverySshKeyFieldId'));
  },
  getSshKey: () => {
    return cy.get(Cypress.env('inputSshPublicKeyFieldId'));
  },
  validateSupportLimitation: () => {
    cy.newByDataTestId(Cypress.env('networkingVmsAlert'))
      .should('be.visible')
      .contains(Cypress.env('vmsSupportLimitationText'));
  },
  validateBMnoSupportLimitation: () => {
    cy.newByDataTestId(Cypress.env('networkingVmsAlert')).should('not.exist');
  },
  checkDhcpSupportLevel: () => {
    cy.get(Cypress.env('vipAutoAllocSupportLevel'))
      .should('be.visible')
      .contains(Cypress.env('devPreviewSupportLevel'));
  },
  waitForNetworkStatusToNotContain: (
    text,
    numMasters: number = Cypress.env('NUM_MASTERS'),
    numWorkers: number = Cypress.env('NUM_WORKERS'),
    timeout = Cypress.env('HOST_READY_TIMEOUT'),
  ) => {
    for (let i = 2; i <= numMasters + numWorkers + 1; i++) {
      cy.hostDetailSelector(i, 'Status', timeout).should('not.contain', text);
    }
  },
  waitForNetworkStatus: (
    status,
    numMasters: number = Cypress.env('NUM_MASTERS'),
    numWorkers: number = Cypress.env('NUM_WORKERS'),
    timeout = Cypress.env('HOST_READY_TIMEOUT'),
  ) => {
    for (let i = 2; i <= numMasters + numWorkers + 1; i++) {
      cy.hostDetailSelector(i, 'Status', timeout).should('contain', status);
    }
  },
  waitForHostNetworkStatusInsufficient: (idx, timeout = Cypress.env('HOST_STATUS_INSUFFICIENT_TIMEOUT')) => {
    // host row index starts at 0 and increments by 2
    cy.newByDataTestId(`host-row-${idx}`).within(() => {
      cy.newByDataTestId('nic-status', timeout).should('contain', 'Insufficient');
    });
  },
  getClusterNetworkCidr: () => {
    return cy.get(Cypress.env('clusterNetworkCidrFieldId'));
  },
  getClusterNetworkPrefix: () => {
    return cy.get(Cypress.env('clusterNetworks0HostPrefixFieldId'));
  },
  getServiceCidr: () => {
    return cy.get(Cypress.env('serviceNetworks0CidrFieldId'));
  },
  enableAdvancedNetworking: (
    clusterCidr = Cypress.env('NETWORK_CIDR'),
    networkPrefix = Cypress.env('NETWORK_HOST_PREFIX'),
    serviceCidr = Cypress.env('SERVICE_NETWORK_CIDR'),
  ) => {
    networkingPage.getAdvancedNetwork().scrollIntoView().check().should('be.checked');
    if (clusterCidr) {
      networkingPage.getClusterNetworkCidr().should('be.visible').fill(clusterCidr).should('have.value', clusterCidr);
    }
    if (networkPrefix) {
      networkingPage
        .getClusterNetworkPrefix()
        .should('be.visible')
        .fill(networkPrefix)
        .should('have.value', networkPrefix);
    }
    if (serviceCidr) {
      networkingPage.getServiceCidr().should('be.visible').fill(serviceCidr).should('have.value', serviceCidr);
    }
  },
  getApiVipField: () => {
    return cy.get(Cypress.env('apiVipFieldId'));
  },
  getIngressVipField: () => {
    return cy.get(Cypress.env('ingressVipFieldId'));
  },
  inputApiVipIngressVip: (apiVip = Cypress.env('API_VIP'), ingressVip = Cypress.env('INGRESS_VIP')) => {
    const fillField = (element, value) => {
      element.should('be.visible').fill(value).should('have.value', value);
    };
    if (apiVip) {
      fillField(networkingPage.getApiVipField(), apiVip);
    }
    if (ingressVip) {
      fillField(networkingPage.getIngressVipField(), apiVip);
    }
  },
  inputClusterNetworkHostPrefix: (hostPrefix = Cypress.env('NETWORK_HOST_PREFIX')) => {
    cy.get(Cypress.env('clusterNetworks0HostPrefixFieldId')).fill(hostPrefix).should('have.value', hostPrefix);
  },
  inputClusterNetworkCidr: (networkCidr = Cypress.env('NETWORK_CIDR')) => {
    cy.get(Cypress.env('clusterNetworkCidrFieldId')).fill(networkCidr).should('have.value', networkCidr);
  },
  inputServiceNetworkCidr: (serviceCidr = Cypress.env('SERVICE_NETWORK_CIDR')) => {
    cy.get(Cypress.env('serviceNetworks0CidrFieldId')).fill(serviceCidr).should('have.value', serviceCidr);
  },
  inputIpv6ClusterNetworkCidr: (ipv6ClusterNetworkCidr) => {
    cy.get('#form-input-clusterNetworks-1-cidr-field').scrollIntoView().type(ipv6ClusterNetworkCidr);
  },
  inputIpv6ClusterNetworkHostPrefix: (ipv6ClusterNetworkHostPrefix) => {
    cy.get('#form-input-clusterNetworks-1-hostPrefix-field').scrollIntoView().type(ipv6ClusterNetworkHostPrefix);
  },
  inputIpv6ServiceNetworkCidr: (ipv6ServiceNetworkCidr) => {
    cy.get('#form-input-serviceNetworks-1-cidr-field').scrollIntoView().type(ipv6ServiceNetworkCidr);
  },
  statusPopover: {
    waitForPrimaryStatusButton: (idx, timeout = Cypress.env('WAIT_FOR_PRIMARY_STATUS_BUTTON')) => {
      cy.get(
        `[data-testid=host-row-${idx}] > ${Cypress.env(
          'nicStatus',
        )} > .pf-m-align-items-center > .pf-l-flex > .pf-c-button`,
        { timeout: timeout },
      ).should('be.visible');
    },
    open: (idx) => {
      cy.get(
        `[data-testid=host-row-${idx}] > ${Cypress.env(
          'nicStatus',
        )} > .pf-m-align-items-center > .pf-l-flex > .pf-c-button`,
      )
        .scrollIntoView()
        .should('be.visible')
        .click();
    },
    openSoftValidations: (idx) => {
      cy.get(
        `[data-testid=host-row-${idx}] > ${Cypress.env(
          'nicStatus',
        )} > .pf-m-align-items-center > .pf-l-flex > .pf-u-font-size-xs > .pf-c-button`,
      )
        .should('be.visible')
        .click();
    },
    validateAlertGroupItem: (msg, timeout = Cypress.env('DNS_RESOLUTION_ALERT_MESSAGE_TIMEOUT')) => {
      cy.get(`li:contains('${msg}')`, { timeout: timeout });
    },
    close: () => {
      cy.get('.pf-c-popover__content > .pf-c-button > svg').should('be.visible').click();
    },
  },
  validateClusterNetworkHostPrefix: (hostPrefix = Cypress.env('NETWORK_HOST_PREFIX')) => {
    cy.get(Cypress.env('clusterNetworks0HostPrefixFieldId')).should('have.value', hostPrefix);
  },
  validateClusterNetworkCidr: (networkCidr = Cypress.env('NETWORK_CIDR')) => {
    cy.get(Cypress.env('clusterNetworkCidrFieldId')).should('have.value', networkCidr);
  },
  validateServiceNetworkCidr: (serviceCidr = Cypress.env('SERVICE_NETWORK_CIDR')) => {
    cy.get(Cypress.env('serviceNetworks0CidrFieldId')).should('have.value', serviceCidr);
  },
  getApiVipFieldHelper: () => {
    return cy.get(Cypress.env('apiVipFieldHelperId'));
  },
  getClusterNetworkCidrFieldHelper: () => {
    return cy.get(Cypress.env('clusterNetworkCidrFieldHelperId'));
  },
  getClusterNetworkHostPrefixFieldHelper: () => {
    return cy.get(Cypress.env('clusterNetworkHostPrefixFieldHelperId'));
  },
  getServiceNetworkCidrFieldHelper: () => {
    return cy.get(Cypress.env('serviceNetworkCidrFieldHelperId'));
  },
  getIngressVipFieldHelper: () => {
    return cy.get(Cypress.env('ingressVipFieldHelperId'));
  },
  enableUserManagedNetworking: () => {
    cy.get(`.pf-c-radio__label:contains(${Cypress.env('userManagedNetworkingRadioText')})`)
      .scrollIntoView()
      .click({ force: true });
  },
  validateUserManageNetworkingConfigContent: () => {
    cy.get('.pf-c-content')
      .should('be.visible')
      .within(() => {
        cy.get('p').should('contain', 'Please refer to the');
        cy.get('li').should((list) => {
          expect(list).to.have.length(4);
          expect(list.eq(0)).to.have.text('DHCP or static IP Addresses');
          expect(list.eq(1)).to.have.text('Load balancers');
          expect(list.eq(2)).to.have.text('Network ports');
          expect(list.eq(3)).to.have.text('DNS');
        });
      });
  },
  getSdnNetworkingField: () => {
    return cy.get(Cypress.env('openshiftSdnInputValue')).scrollIntoView();
  },
  getOvnNetworkingField: () => {
    return cy.get(Cypress.env('ovnKubernetesRadioId')).scrollIntoView();
  },
  setOvnNetworking: () => {
    cy.get(`.pf-c-radio__label:contains(${Cypress.env('openVirtualNetworkingRadioText')})`)
      .scrollIntoView()
      .click({ force: true });
  },
  clickMainBody: () => {
    cy.get('.pf-c-wizard__nav').click();
  },
  confirmStackTypeChange: () => {
    cy.get('body').then(($body) => {
      if ($body.hasClass('pf-c-backdrop__open')) {
        cy.get(`button[data-testid='confirm-modal-submit']`).click();
      }
    });
  },
};
