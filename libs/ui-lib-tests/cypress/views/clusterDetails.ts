import { pullSecret } from '../fixtures';

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
    clusterDetailsPage.getOpenshiftVersionField().find('button.pf-v5-c-dropdown__toggle').click();
  },
  getOpenshiftVersionDropdown: () => {
    return clusterDetailsPage.getOpenshiftVersionField().find('.pf-v5-c-dropdown__menu');
  },
  getSelectedOpenShiftVersion: () => {
    return clusterDetailsPage.getOpenshiftVersionField().find('.pf-v5-c-dropdown__toggle-text');
  },
  inputOpenshiftVersion: (version = Cypress.env('OPENSHIFT_VERSION')) => {
    clusterDetailsPage.openOpenshiftVersionDropdown();
    clusterDetailsPage.getOpenshiftVersionDropdown().within(() => {
      cy.get('li').contains(version).click();
    });
    clusterDetailsPage.getSelectedOpenShiftVersion().should('contain.text', `OpenShift ${version}`);
  },
  clickLinkAllAvailableVersions: () => {
    clusterDetailsPage.getOpenshiftVersionDropdown().within(() => {
      cy.get('li').contains('Show all available versions').click();
    });
  },
  getPullSecret: () => {
    return cy.get(Cypress.env('pullSecretFieldId'));
  },
  getPullSecretFieldHelper: () => {
    return cy.get(Cypress.env('pullSecretFieldHelperId'));
  },
  inputPullSecret: (pullSecretValue = pullSecret) => {
    clusterDetailsPage.getPullSecret().clear();
    cy.pasteText(Cypress.env('pullSecretFieldId'), pullSecretValue);
    clusterDetailsPage.getPullSecret().should('contain.text', pullSecretValue);
  },
  checkAiTechSupportLevel: () => {
    cy.get(Cypress.env('assistedInstallerSupportLevel'))
      .should('be.visible')
      .should('contain.text', Cypress.env('techPreviewSupportLevel'));
  },
  checkSnoDevSupportLevel: () => {
    cy.get(Cypress.env('snoSupportLevel'))
      .should('be.visible')
      .should('contain.text', Cypress.env('devPreviewSupportLevel'));
  },
  getBaseDnsDomain: () => {
    return cy.get(Cypress.env('baseDnsDomainFieldId'));
  },
  inputBaseDnsDomain: (dns = Cypress.env('DNS_DOMAIN_NAME')) => {
    clusterDetailsPage.getBaseDnsDomain().clear().type(dns).should('have.value', dns);
  },
  getStaticIpNetworkConfig: () => {
    return cy.get(Cypress.env('staticIpNetworkConfigFieldId'));
  },
  openCpuArchitectureDropdown: () => {
    cy.get(`${Cypress.env('cpuArchitectureFieldId')} > button.pf-v5-c-dropdown__toggle`).click();
  },
  selectCpuArchitecture: (cpuArchitecture) => {
    cy.get(`ul.pf-v5-c-dropdown__menu li[id=${cpuArchitecture}] a`).click();
    cy.get(`${Cypress.env('cpuArchitectureFieldId')} .pf-v5-c-dropdown__toggle-text`)
      .invoke('text')
      .should('match', new RegExp(cpuArchitecture, 'i'));
  },
  CpuArchitectureExists: (cpuArchitecture) => {
    cy.get(`ul.pf-v5-c-dropdown__menu li[id=${cpuArchitecture}] a`).should('exist');
  },
  CpuArchitectureNotExists: (cpuArchitecture) => {
    cy.get(`ul.pf-v5-c-dropdown__menu li[id=${cpuArchitecture}] a`).should('not.exist');
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
    cy.get(`.pf-v5-c-radio__label:contains(${Cypress.env('enableStaticIpRadioButtonText')})`)
      .scrollIntoView()
      .click({ force: true });
  },
  validateInputNameFieldHelper: (status) => {
    cy.get(`[aria-label='Validation'] > svg`)
      .invoke('attr', 'fill')
      .should('contain.text', status === 'fail' ? '#c9190b' : '#3e8635');
  },
  getClusterNameFieldValidator: () => {
    return cy.get(Cypress.env('clusterNameFieldValidator'));
  },
  validateInputNameFieldHelperError: (...childNums: number[]) => {
    clusterDetailsPage.getClusterNameFieldValidator().click();
    for (let i = 0; i < childNums.length; i++) {
      cy.get(`[id^=popover-pf-] > ul > :nth-child(${childNums[i]})`).should(
        'have.class',
        'pf-v5-c-helper-text__item pf-m-error pf-m-dynamic',
      );
    }
  },
  getInputDnsDomainFieldHelper: () => {
    return cy.get(Cypress.env('baseDnsDomainFieldHelperId'));
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
  clickClusterDetailsBody: () => {
    cy.get('#wizard-cluster-details__form').click();
  },
  validateInputDnsDomainFieldHelper: (msg) => {
    cy.get(Cypress.env('baseDnsDomainFieldHelperErrorId')).should('contain', msg);
  },
  clearPullSecret: () => {
    cy.get(Cypress.env('pullSecretFieldId')).clear().blur();
  },
  validateInputPullSecretFieldHelper: (msg) => {
    cy.get(Cypress.env('pullSecretFieldHelperErrorId')).should('contain', msg);
  },
  openControlPlaneNodesDropdown: () => {
    cy.get(`${Cypress.env('controlPlaneNodesFieldId')} > button.pf-v5-c-dropdown__toggle`).click();
  },
  selectControlPlaneNodeOption: (controlPlaneCount) => {
    cy.get(`ul.pf-v5-c-dropdown__menu li[id=${controlPlaneCount}] a`).click();
    cy.get(`${Cypress.env('controlPlaneNodesFieldId')} .pf-v5-c-dropdown__toggle-text`)
      .invoke('text')
      .should('match', new RegExp(controlPlaneCount, 'i'));
  },
};
