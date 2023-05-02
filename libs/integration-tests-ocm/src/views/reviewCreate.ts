export const reviewAndCreatePage = {
  expandPreflightCheckSection: () => {
    cy.get(Cypress.env('clusterPreflightChecksTitle')).then((val) => {
      if (!val.is('visible')) {
        cy.get(Cypress.env('preflightChecksSectionExpander')).click();
      }
    });
  },
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
  checkAllClusterValidationsPassed: (timeout = 1000) => {
    cy.get(Cypress.env('clusterPreflightChecksResult'), { timeout }).should(
        'contain',
        Cypress.env('allValidationsPassedText'),
    );
  },
  checkAllHostsValidationsPassed: (timeout = 1000) => {
    cy.get(Cypress.env('hostsPreflightChecksResult'), { timeout }).should(
        'contain',
        Cypress.env('allValidationsPassedText'),
    );
  },
  waitForInstallButton: (timeout = Cypress.env('START_INSTALLATION_TIMEOUT')) => {
    cy.get(Cypress.env('buttonInstall'), { timeout: timeout }).should('be.enabled');
  },
  getInstallButton: () => {
    return cy.get(Cypress.env('buttonInstall'));
  },
};
