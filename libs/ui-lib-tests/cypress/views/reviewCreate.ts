export const reviewAndCreatePage = {
  expandPreflightCheckSection: () => {
    cy.get(Cypress.expose('clusterPreflightChecksTitle')).then((val) => {
      if (!val.is('visible')) {
        cy.get(Cypress.expose('preflightChecksSectionExpander')).click();
      }
    });
  },
  validateClusterDetails: ({
    clusterName = Cypress.expose('CLUSTER_NAME'),
    dns = Cypress.expose('DNS_DOMAIN_NAME'),
    version = Cypress.expose('OPENSHIFT_VERSION'),
    stackType = 'IPv4',
  } = {}) => {
    cy.get(Cypress.expose('clusterAddressValueId')).should('contain.text', `${clusterName}.${dns}`);
    cy.get(Cypress.expose('openshiftVersionValueId')).should('contain.text', version);
    cy.get(Cypress.expose('stackTypeValueId')).should('contain.text', stackType);
  },
  checkAllClusterValidationsPassed: (timeout = 1000) => {
    cy.get(Cypress.expose('clusterPreflightChecksResult'), { timeout }).should(
      'contain',
      Cypress.expose('allValidationsPassedText'),
    );
  },
  checkAllHostsValidationsPassed: (timeout = 1000) => {
    cy.get(Cypress.expose('hostsPreflightChecksResult'), { timeout }).should(
      'contain',
      Cypress.expose('allValidationsPassedText'),
    );
  },
  waitForInstallButton: (timeout = Cypress.expose('START_INSTALLATION_TIMEOUT')) => {
    cy.get('button[name="install"]', { timeout: timeout }).should('be.enabled');
  },
  getInstallButton: () => {
    return cy.get('button[name="install"]');
  },
  getCustomManifestsSection: () => {
    return cy.get('#custom-manifests-expandable');
  },
  getCustomManifestsDetail: () => {
    return cy.findByTestId('manifest-detail-manifests-manifest1.yaml');
  },
};
