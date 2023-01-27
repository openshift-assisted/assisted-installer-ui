export const reviewAndCreatePage = {
  validateClusterDetails: ({
    clusterName = Cypress.env('CLUSTER_NAME'),
    dns = Cypress.env('DNS_DOMAIN_NAME'),
    version = Cypress.env('OPENSHIFT_VERSION'),
    stackType = 'IPv4',
  } = {}) => {
    cy.get(Cypress.env('clusterAddressValueId')).should('contain', `${clusterName}.${dns}`);
    cy.get(Cypress.env('openshiftVersionValueId')).should('contain', version);
    cy.get(Cypress.env('stackTypeValueId')).should('contain', stackType);
  },
  getClusterValidations: (timeout = 1000) => {
    cy.get(Cypress.env('clusterValidationsValueId')).then((val) => {
      if (!val.is('visible')) {
        cy.get(Cypress.env('clusterValidations')).click();
      }
    });
    return cy.get(Cypress.env('clusterValidationsValueId'), {
      timeout: timeout,
    });
  },
  getHostValidations: (timeout = 1000) => {
    cy.get(Cypress.env('clusterValidationsValueId')).then((val) => {
      if (!val.is('visible')) {
        cy.get(Cypress.env('clusterValidations')).click();
      }
    });
    return cy.get(Cypress.env('hostValidationsValueId'), { timeout: timeout });
  },
  checkAllValidationsPassed: (element) => {
    element.should('contain', Cypress.env('allValidationsPassedText'));
  },
  waitForInstallButton: (timeout = Cypress.env('START_INSTALLATION_TIMEOUT')) => {
    cy.get(Cypress.env('buttonInstall'), { timeout: timeout }).should('be.enabled');
  },
  getInstallButton: () => {
    return cy.get(Cypress.env('buttonInstall'));
  },
};
