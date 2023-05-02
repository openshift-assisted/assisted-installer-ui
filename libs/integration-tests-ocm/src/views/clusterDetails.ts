export const clusterDetailsPage = {
  getClusterNameField: () => {
    return cy.get(Cypress.env('clusterNameFieldId'));
  },
  inputClusterName: (clusterName = Cypress.env('CLUSTER_NAME')) => {
    clusterDetailsPage.getClusterNameField().should('be.visible').clear().type(clusterName);
  },
  getOpenshiftVersionField: () => {
    return cy.get(Cypress.env('openshiftVersionFieldId'));
  },
  openOpenshiftVersionDropdown: () => {
    clusterDetailsPage.getOpenshiftVersionField().find('button.pf-c-dropdown__toggle').click();
  },
  getOpenshiftVersionDropdown: () => {
    return clusterDetailsPage.getOpenshiftVersionField().find('.pf-c-dropdown__menu');
  },
  getSelectedOpenShiftVersion: () => {
    return clusterDetailsPage.getOpenshiftVersionField().find('.pf-c-dropdown__toggle-text');
  },
  inputOpenshiftVersion: (version = Cypress.env('OPENSHIFT_VERSION')) => {
    clusterDetailsPage.openOpenshiftVersionDropdown();
    clusterDetailsPage.getOpenshiftVersionDropdown().within(() => {
      cy.get('li').contains(version).click();
    });
    clusterDetailsPage.getSelectedOpenShiftVersion().should('contain', `OpenShift ${version}`);
  },
  getPullSecret: () => {
    return cy.get(Cypress.env('pullSecretFieldId'));
  },
  getPullSecretFieldHelper: () => {
    return cy.get(Cypress.env('pullSecretFieldHelperId'));
  },
  inputPullSecret: (pullSecret = Cypress.env('PULL_SECRET')) => {
    if (Cypress.env('OCM_USER')) {
      clusterDetailsPage.getPullSecret().check();
    }
    clusterDetailsPage.getPullSecret().clear();
    cy.pasteText(Cypress.env('pullSecretFieldId'), pullSecret);
    clusterDetailsPage.getPullSecret().should('contain', pullSecret);
  },
  checkAiTechSupportLevel: () => {
    cy.get(Cypress.env('assistedInstallerSupportLevel'))
      .should('be.visible')
      .contains(Cypress.env('techPreviewSupportLevel'));
  },
  checkSnoDevSupportLevel: () => {
    cy.get(Cypress.env('snoSupportLevel')).should('be.visible').contains(Cypress.env('devPreviewSupportLevel'));
  },
  getBaseDnsDomain: () => {
    return cy.get(Cypress.env('baseDnsDomainFieldId'));
  },
  inputbaseDnsDomain: (dns = Cypress.env('DNS_DOMAIN_NAME')) => {
    clusterDetailsPage.getBaseDnsDomain().clear().type(dns).should('have.value', dns);
  },
  getSno: () => {
    return cy.get(Cypress.env('highAvailabilityModeFieldId'));
  },
  enableSno: () => {
    clusterDetailsPage.getSno().should('be.visible').check();
    clusterDetailsPage.getSno().should('be.checked');
  },
  getStaticIpNetworkConfig: () => {
    return cy.get(Cypress.env('staticIpNetworkConfigFieldId'));
  },
  openCpuArchitectureDropdown: () => {
    cy.get(`${Cypress.env('cpuArchitectureFieldId')} > button.pf-c-dropdown__toggle`).click();
  },
  selectCpuArchitecture: (cpuArchitecture) => {
    cy.get(`ul.pf-c-dropdown__menu li[id=${cpuArchitecture}] a`).click();
    cy.get(`${Cypress.env('cpuArchitectureFieldId')} .pf-c-dropdown__toggle-text`).should('contain', cpuArchitecture);
  },
  checkDisabledCpuArchitectureStatus: (cpuArchitecture, isDisabled) => {
    cy.get(`ul.pf-c-dropdown__menu li[id=${cpuArchitecture}] a`)
      .invoke('attr', 'aria-disabled')
      .should('eq', `${isDisabled}`); // it's a string
  },
  getSnoDisclaimer: () => {
    return cy.get(Cypress.env('checkboxSNODisclaimerFieldId'));
  },
  getRedHatDnsServiceCheck: () => {
    return cy.get(Cypress.env('useRedHatDnsServiceFieldId'));
  },
  setRedHatDnsService: () => {
    // set first option val to dnsDomain
    cy.get(`#form-input-baseDnsDomain-field > option`)
      .eq(0)
      .then((option) => {
        Cypress.env('route53Dns', option.val());
      });
  },
  enableStaticNetworking: () => {
    cy.get(`.pf-c-radio__label:contains(${Cypress.env('enableStaticIpRadioButtonText')})`)
      .scrollIntoView()
      .click({ force: true });
  },
  validateInputNameFieldHelper: (status) => {
    cy.get(`[aria-label='Validation'] > svg`)
      .invoke('attr', 'fill')
      .should('contain', status === 'fail' ? '#c9190b' : '#3e8635');
  },
  getClusterNameFieldValidator: () => {
    return cy.get(Cypress.env('clusterNameFieldValidator'));
  },
  validateInputNameFieldHelperError: (...childNums: number[]) => {
    clusterDetailsPage.getClusterNameFieldValidator().click();
    for (let i = 0; i < childNums.length; i++) {
      cy.get(`[id^=popover-pf-] > ul > :nth-child(${childNums[i]})`).should(
        'have.class',
        'pf-c-helper-text__item pf-m-error pf-m-dynamic',
      );
    }
  },
  getInputDnsDomainFieldHelper: () => {
    return cy.get(Cypress.env('baseDnsDomainFieldHelperId'));
  },
  getClusterDetailsBody: () => {
    return cy.get('.pf-l-grid');
  },
};
