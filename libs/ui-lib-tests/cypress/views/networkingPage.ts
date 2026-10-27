export const networkingPage = {
  getUserManagedNetworking: () => {
    return cy.get(Cypress.expose('userManagedFieldRadioId'));
  },
  getClusterManagedNetworking: () => {
    return cy.get(Cypress.expose('clusterManagedFieldRadioId'));
  },
  getVipDhcp: () => cy.get(Cypress.expose('vipDhcpAllocationFieldId')),
  getAdvancedNetwork: () => cy.get(Cypress.expose('useAdvancednetworkingId')),
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
    cy.get(Cypress.expose('hostSubnetFieldId'))
      .contains('/')
      .then((element) => {
        const text = element.text();
        cy.get(Cypress.expose('hostSubnetFieldId')).select(text);
      });
  },
  getClusterSubnetCidrIpv4: () => {
    return cy.get('#form-input-machineNetworks-0-cidr-field');
  },
  getClusterSubnetCidrIpv6: () => {
    return cy.get('#form-input-machineNetworks-1-cidr-field');
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
    cy.newByDataTestId(`${Cypress.expose('hostRowDataTestIdPrefix')}${idx}`).within(() => {
      cy.newByDataTestId(Cypress.expose('nicNameDataTestId')).then((nicName) => {
        const interfaceName = nicName.text();
        cy.log(`Interface Name: ${interfaceName}`);
        Cypress.expose(`interfaceName`, interfaceName);
      });
    });
  },
  getShareSshKeyInput: () => {
    return cy.get(Cypress.expose('shareDiscoverySshKeyFieldId'));
  },
  getSshKey: () => {
    return cy.get(Cypress.expose('inputSshPublicKeyFieldId'));
  },
  validateSupportLimitation: () => {
    cy.newByDataTestId(Cypress.expose('networkingVmsAlert'))
      .should('be.visible')
      .should('contain.text', Cypress.expose('vmsSupportLimitationText'));
  },
  validateBMnoSupportLimitation: () => {
    cy.newByDataTestId(Cypress.expose('networkingVmsAlert')).should('not.exist');
  },
  checkDhcpSupportLevel: () => {
    cy.get(Cypress.expose('vipAutoAllocSupportLevel'))
      .should('be.visible')
      .should('contain.text', Cypress.expose('devPreviewSupportLevel'));
  },
  waitForNetworkStatusToNotContain: (text, timeout = Cypress.expose('HOST_READY_TIMEOUT')) => {
    cy.get('table.hosts-table > tbody > tr:not([hidden])').each((row) =>
      cy.wrap(row).find('td[data-testid="host-status"]', { timeout }).should('not.contain', text),
    );
  },
  waitForNetworkStatus: (status, timeout = Cypress.expose('HOST_READY_TIMEOUT')) => {
    cy.get('table.hosts-table > tbody > tr:not([hidden])').each((row) =>
      cy
        .wrap(row)
        .find('td[data-testid="host-status"]', { timeout })
        .should('contain.text', status),
    );
  },
  waitForHostNetworkStatusInsufficient: (
    idx,
    timeout = Cypress.expose('HOST_STATUS_INSUFFICIENT_TIMEOUT'),
  ) => {
    // host row index starts at 0 and increments by 2
    cy.newByDataTestId(`host-row-${idx}`).within(() => {
      cy.newByDataTestId('host-status', timeout).should('contain.text', 'Insufficient');
    });
  },
  getClusterNetworkCidr: () => {
    return cy.get(Cypress.expose('clusterNetworkCidrFieldId'));
  },
  getClusterNetworkPrefix: () => {
    return cy.get(Cypress.expose('clusterNetworks0HostPrefixFieldId'));
  },
  getServiceCidr: () => {
    return cy.get(Cypress.expose('serviceNetworks0CidrFieldId'));
  },
  enableAdvancedNetworking: (
    clusterCidr = Cypress.expose('NETWORK_CIDR'),
    networkPrefix = Cypress.expose('NETWORK_HOST_PREFIX'),
    serviceCidr = Cypress.expose('SERVICE_NETWORK_CIDR'),
  ) => {
    networkingPage.getAdvancedNetwork().scrollIntoView().check().should('be.checked');
    if (clusterCidr) {
      networkingPage
        .getClusterNetworkCidr()
        .should('be.visible')
        .fill(clusterCidr)
        .should('have.value', clusterCidr);
    }
    if (networkPrefix) {
      networkingPage
        .getClusterNetworkPrefix()
        .should('be.visible')
        .fill(networkPrefix)
        .should('have.value', networkPrefix);
    }
    if (serviceCidr) {
      networkingPage
        .getServiceCidr()
        .should('be.visible')
        .fill(serviceCidr)
        .should('have.value', serviceCidr);
    }
  },
  getApiVipField: () => {
    return cy.get('#form-input-apiVips-0-ip-field');
  },
  getIngressVipField: () => {
    return cy.get('#form-input-ingressVips-0-ip-field');
  },
  getApiVipFieldSecondary: () => {
    return cy.get('#form-input-apiVips-1-ip-field');
  },
  getIngressVipFieldSecondary: () => {
    return cy.get('#form-input-ingressVips-1-ip-field');
  },
  inputApiVipIngressVip: (
    apiVip = Cypress.expose('API_VIP'),
    ingressVip = Cypress.expose('INGRESS_VIP'),
  ) => {
    const fillField = (element, value) => {
      element.scrollIntoView().should('be.visible').fill(value).should('have.value', value);
    };
    if (apiVip) {
      fillField(networkingPage.getApiVipField(), apiVip);
    }
    if (ingressVip) {
      fillField(networkingPage.getIngressVipField(), ingressVip);
    }
  },
  inputApiVipIngressVipSecondary: (
    apiVip = Cypress.expose('API_VIP'),
    ingressVip = Cypress.expose('INGRESS_VIP'),
  ) => {
    const fillField = (element, value) => {
      element.scrollIntoView().should('be.visible').fill(value).should('have.value', value);
    };
    if (apiVip) {
      fillField(networkingPage.getApiVipFieldSecondary(), apiVip);
    }
    if (ingressVip) {
      fillField(networkingPage.getIngressVipFieldSecondary(), ingressVip);
    }
  },
  inputClusterNetworkHostPrefix: (hostPrefix = Cypress.expose('NETWORK_HOST_PREFIX')) => {
    cy.get(Cypress.expose('clusterNetworks0HostPrefixFieldId'))
      .fill(hostPrefix)
      .should('have.value', hostPrefix);
  },
  inputClusterNetworkCidr: (networkCidr = Cypress.expose('NETWORK_CIDR')) => {
    cy.get(Cypress.expose('clusterNetworkCidrFieldId'))
      .fill(networkCidr)
      .should('have.value', networkCidr);
  },
  inputServiceNetworkCidr: (serviceCidr = Cypress.expose('SERVICE_NETWORK_CIDR')) => {
    cy.get(Cypress.expose('serviceNetworks0CidrFieldId'))
      .fill(serviceCidr)
      .should('have.value', serviceCidr);
  },
  inputIpv6ClusterNetworkCidr: (ipv6ClusterNetworkCidr) => {
    cy.get('#form-input-clusterNetworks-1-cidr-field')
      .scrollIntoView()
      .type(ipv6ClusterNetworkCidr);
  },
  inputIpv6ClusterNetworkHostPrefix: (ipv6ClusterNetworkHostPrefix) => {
    cy.get('#form-input-clusterNetworks-1-hostPrefix-field')
      .scrollIntoView()
      .type(ipv6ClusterNetworkHostPrefix);
  },
  inputIpv6ServiceNetworkCidr: (ipv6ServiceNetworkCidr) => {
    cy.get('#form-input-serviceNetworks-1-cidr-field')
      .scrollIntoView()
      .type(ipv6ServiceNetworkCidr);
  },
  statusPopover: {
    waitForPrimaryStatusButton: (idx, timeout = Cypress.expose('WAIT_FOR_PRIMARY_STATUS_BUTTON')) => {
      cy.get(
        `[data-testid=host-row-${idx}] > ${Cypress.expose(
          'nicStatus',
        )} > .pf-m-align-items-center > .pf-l-flex > .pf-v6-c-button`,
        { timeout: timeout },
      ).should('be.visible');
    },
    open: (idx) => {
      cy.get(
        `[data-testid=host-row-${idx}] > ${Cypress.expose(
          'nicStatus',
        )} > .pf-m-align-items-center > .pf-l-flex > .pf-v6-c-button`,
      )
        .scrollIntoView()
        .should('be.visible')
        .click();
    },
    openSoftValidations: (idx) => {
      cy.get(
        `[data-testid=host-row-${idx}] > ${Cypress.expose(
          'nicStatus',
        )} > .pf-m-align-items-center > .pf-l-flex > .pf-v6-u-font-size-xs > .pf-v6-c-button`,
      )
        .should('be.visible')
        .click();
    },
    validateAlertGroupItem: (
      msg,
      timeout = Cypress.expose('DNS_RESOLUTION_ALERT_MESSAGE_TIMEOUT'),
    ) => {
      cy.get(`li:contains('${msg}')`, { timeout: timeout });
    },
    close: () => {
      cy.get('.pf-v6-c-popover__content > .pf-v6-c-button > svg').should('be.visible').click();
    },
  },
  validateClusterNetworkHostPrefix: (hostPrefix = Cypress.expose('NETWORK_HOST_PREFIX')) => {
    cy.get(Cypress.expose('clusterNetworks0HostPrefixFieldId')).should('have.value', hostPrefix);
  },
  validateClusterNetworkCidr: (networkCidr = Cypress.expose('NETWORK_CIDR')) => {
    cy.get(Cypress.expose('clusterNetworkCidrFieldId')).should('have.value', networkCidr);
  },
  validateServiceNetworkCidr: (serviceCidr = Cypress.expose('SERVICE_NETWORK_CIDR')) => {
    cy.get(Cypress.expose('serviceNetworks0CidrFieldId')).should('have.value', serviceCidr);
  },
  getApiVipFieldHelper: () => {
    return cy.get(Cypress.expose('apiVipFieldHelperId'));
  },
  getClusterNetworkCidrFieldHelper: () => {
    return cy.get(Cypress.expose('clusterNetworkCidrFieldHelperId'));
  },
  getClusterNetworkHostPrefixFieldHelper: () => {
    return cy.get(Cypress.expose('clusterNetworkHostPrefixFieldHelperId'));
  },
  getServiceNetworkCidrFieldHelper: () => {
    return cy.get(Cypress.expose('serviceNetworkCidrFieldHelperId'));
  },
  getIngressVipFieldHelper: () => {
    return cy.get(Cypress.expose('ingressVipFieldHelperId'));
  },
  enableUserManagedNetworking: () => {
    cy.get(`.pf-v6-c-radio__label:contains(${Cypress.expose('userManagedNetworkingRadioText')})`)
      .scrollIntoView()
      .click({ force: true });
  },
  validateUserManageNetworkingConfigContent: () => {
    cy.get('.pf-v6-c-content')
      .should('be.visible')
      .within(() => {
        cy.get('p').should('contain.text', 'Please refer to the');
        cy.get('li').should((list) => {
          expect(list).to.have.length(4);
          expect(list.eq(0)).to.have.text('DHCP or static IP Addresses');
          expect(list.eq(1)).to.have.text('Load balancers');
          expect(list.eq(2)).to.have.text('Network ports');
          expect(list.eq(3)).to.have.text('DNS');
        });
      });
  },
  getNetworkTypeToggle: () => {
    return cy.get(Cypress.expose('networkTypeToggleId')).scrollIntoView();
  },
  setOvnNetworking: () => {
    cy.get(`.pf-v6-c-radio__label:contains(${Cypress.expose('openVirtualNetworkingRadioText')})`)
      .scrollIntoView()
      .click({ force: true });
  },
  clickMainBody: () => {
    cy.get('.pf-v6-c-wizard__nav').click();
  },
  confirmStackTypeChange: () => {
    cy.get('body').then(($body) => {
      if ($body.hasClass('pf-v6-c-backdrop__open')) {
        cy.get(`button[data-testid='confirm-modal-submit']`).click();
      }
    });
  },
};
