import * as utils from '../support/utils';

export const commonActions = {
  getWizardStepNav: (stepName: string) => {
    return cy.get('.pf-c-wizard__nav-item').contains(stepName);
  },
  getNextButton: () => {
    return cy.get(Cypress.env('nextButton'));
  },
  clickNextButton: () => {
    commonActions.getNextButton().should('be.enabled').click();
  },
  waitForNext: () => {
    cy.get(Cypress.env('nextButton')).should('be.enabled');
  },
  getInfoAlert: () => {
    return cy.get(Cypress.env('infoAlertAriaLabel'));
  },
  getWarningAlert: () => {
    return cy.get(Cypress.env('warningAlertAriaLabel'));
  },
  getDangerAlert: () => {
    return cy.get(Cypress.env('dangerAlertAriaLabel'));
  },
  getDNSErrorMessage: () => {
    return cy.get('#form-input-dns-field-helper-error');
  },
      visitNewClusterPage: () => {
        cy.visit('/clusters/~new');
      },
      visitClusterDetailsPage: () => {
        cy.visit(`/clusters/${Cypress.env('clusterId')}`);
      },
  verifyIsAtStep: (stepTitle: string, timeout?: number) => {
    cy.get('h2', { timeout }).should('contain.text', stepTitle);
  },
  startAtOperatorsStep: () => {
    commonActions.getWizardStepNav('Operators').click();
  },
  startAtStorageStep: () => {
    commonActions.getWizardStepNav('Storage').click();
  },
  startAtCustomManifestsStep: () => {
    commonActions.getWizardStepNav('Custom manifests').click();
  },
  startAtNetworkingStep: () => {
    if (utils.hasWizardSignal('READY_TO_INSTALL')) {
      commonActions.getWizardStepNav('Networking').click();
    } else {
      commonActions.verifyIsAtStep('Host discovery');
      commonActions.clickNextButton();
      commonActions.verifyIsAtStep('Storage');
      commonActions.clickNextButton();
    }
  },
};
