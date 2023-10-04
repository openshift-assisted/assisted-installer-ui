import { pullSecret } from '../../../fixtures';

export const clusterDetailsPage = {
  getClusterNameField: () => {
    return cy.get('#form-input-name-field');
  },
  inputClusterName: (clusterName = Cypress.env('CLUSTER_NAME')) => {
    clusterDetailsPage.getClusterNameField().should('be.visible').clear().type(clusterName);
  },
  getOpenshiftVersionField: () => {
    return cy.get('#form-input-openshiftVersion-field');
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
    clusterDetailsPage.getSelectedOpenShiftVersion().should('contain.text', `OpenShift ${version}`);
  },
  getPullSecret: () => {
    return cy.get('#form-input-pullSecret-field');
  },
  getPullSecretFieldHelper: () => {
    return cy.get('#form-input-pullSecret-field-helper');
  },
  inputPullSecret: () => {
    clusterDetailsPage.getPullSecret().clear();
    cy.get('#form-input-pullSecret-field').pasteText(pullSecret);
    clusterDetailsPage.getPullSecret().should('contain.text', pullSecret);
  },
  checkAiTechSupportLevel: () => {
    cy.get('[data-testid=assisted-installer-support-level]')
      .should('be.visible')
      .should('contain.text', Cypress.env('techPreviewSupportLevel'));
  },
  checkSnoDevSupportLevel: () => {
    cy.get('[data-testid=SNO-support-level]')
      .should('be.visible')
      .should('contain.text', Cypress.env('devPreviewSupportLevel'));
  },
  getBaseDnsDomain: () => {
    return cy.get('#form-input-baseDnsDomain-field');
  },
  inputBaseDnsDomain: (dns = Cypress.env('DNS_DOMAIN_NAME')) => {
    clusterDetailsPage.getBaseDnsDomain().clear().type(dns).should('have.value', dns);
  },
  getSno: () => {
    return cy.get('#form-input-highAvailabilityMode-field');
  },
  enableSno: () => {
    clusterDetailsPage.getSno().scrollIntoView().should('be.visible').check();
    clusterDetailsPage.getSno().should('be.checked');
  },
  getStaticIpNetworkConfig: () => {
    return cy.get('#form-radio-hostsNetworkConfigurationType-static-field');
  },
  openCpuArchitectureDropdown: () => {
    cy.get('#form-input-cpuArchitecture-field > button.pf-c-dropdown__toggle').click();
  },
  selectCpuArchitecture: (cpuArchitecture) => {
    cy.get(`ul.pf-c-dropdown__menu li[id=${cpuArchitecture}] a`).click();
    cy.get('#form-input-cpuArchitecture-field .pf-c-dropdown__toggle-text')
      .invoke('text')
      .should('match', new RegExp(cpuArchitecture, 'i'));
  },
  CpuArchitectureExists: (cpuArchitecture) => {
    cy.get(`ul.pf-c-dropdown__menu li[id=${cpuArchitecture}] a`).should('exist');
  },
  CpuArchitectureNotExists: (cpuArchitecture) => {
    cy.get(`ul.pf-c-dropdown__menu li[id=${cpuArchitecture}] a`).should('not.exist');
  },
  getSnoDisclaimer: () => {
    return cy.get('#form-checkbox-SNODisclaimer-field');
  },
  getRedHatDnsServiceCheck: () => {
    return cy.get('#form-checkbox-useRedHatDnsService-field');
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
    cy.get('.pf-c-radio__label:contains("Static network configuration")')
      .scrollIntoView()
      .click({ force: true });
  },
  validateInputNameFieldHelper: (status) => {
    cy.get(`[aria-label='Validation'] > svg`)
      .invoke('attr', 'fill')
      .should('contain.text', status === 'fail' ? '#c9190b' : '#3e8635');
  },
  getClusterNameFieldValidator: () => {
    return cy.get('[aria-label=Validation]');
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
    return cy.get('#form-input-baseDnsDomain-field-helper');
  },
  getClusterDetailsBody: () => {
    return cy.get('.pf-l-grid');
  },
  getCustomManifestCheckbox: () => {
    return cy.get('#form-input-addCustomManifest-field');
  },
  getExternalPlatformIntegrationStaticField: () => {
    return cy.get('#form-static-platform-field');
  },
};
