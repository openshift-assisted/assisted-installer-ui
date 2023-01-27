import { getCwd, getUiVersion } from '../support/utils';
import * as utils from '../support/utils';

export const commonActions = {
  clickButtonContainingText: (text: string) => {
    cy.get(`button:contains('${text}')`).scrollIntoView().should('be.visible').click();
  },
  openWizardStep: (stepName: string) => {
    cy.get('.pf-c-wizard__nav-item').contains(stepName).click();
  },
  clickDropDownMenuItem: (menuItemName: string) => {
    cy.get('.pf-c-dropdown__menu-item').contains(menuItemName).click();
  },
  newLogAssistedUIVersion: () => {
    getUiVersion().then((uiVersion) => {
      cy.log('assisted-ui-lib-version', uiVersion);
      getCwd().then((homeDir) => {
        cy.log(`Writing UI version to ${homeDir}/test_artifacts/versions.log`);
        cy.writeFile(`${homeDir}/test_artifacts/versions.log`, `UI: ${uiVersion}`, { flag: 'a+' });
      });
    });
  },
  waitForSpinnerToDisappear: () => {
    cy.get('.pf-c-spinner__tail-ball').should('not.exist');
  },
  waitForValidationsToInitialize: () => {
    cy.get('.pf-m-info').should('not.exist');
  },
  closeCookiesBanner: () => {
    cy.get('body').then(($body) => {
      if ($body.find(Cypress.env('trusteConsentButtonId')).length > 0) {
        cy.get(Cypress.env('trusteConsentButtonId')).click();
      }
    });
  },
  closePendoBanner: () => {
    cy.get('body').then(($body) => {
      if ($body.find(Cypress.env('pendoCloseGuide')).length > 0) {
        cy.get(Cypress.env('pendoCloseGuide')).click();
      }
    });
  },
  getNextButton: () => {
    return cy.get(Cypress.env('nextButton'));
  },
  clickNextButton: () => {
    commonActions.getNextButton().should('be.enabled').click();
  },
  getBackButton: () => {
    return cy.get(Cypress.env('backButton'));
  },
  waitForSave: () => {
    cy.get(Cypress.env('spanRoleProgressBar')).should('not.match', /.*Saving.*changes.*/);
  },
  waitForNext: () => {
    cy.get(Cypress.env('nextButton')).should('be.enabled');
  },
  getHeader: (level = 'h1', timeout = Cypress.env('WAIT_FOR_HEADER_TIMEOUT')) => cy.get(level, { timeout: timeout }),
  getInfoAlert: () => {
    return cy.get(Cypress.env('infoAlertAriaLabel'));
  },
  getDangerAlert: () => {
    return cy.get(Cypress.env('dangerAlertAriaLabel'));
  },
  startAtNetworkingStep: () => {
    if (utils.hasWizardSignal('READY_TO_INSTALL')) {
      commonActions.openWizardStep('Networking');
    } else {
      commonActions.getHeader('h2').should('contain', 'Host discovery');
      commonActions.clickNextButton();
      commonActions.clickNextButton();
    }
  },
  startAtStorageStep: () => {
    commonActions.openWizardStep('Storage');
  },
  visitNewClusterPage: () => {
    cy.visit('/clusters/~new');
  },
  visitClusterDetailsPage: () => {
    cy.visit(`/clusters/${Cypress.env('clusterId')}`);
  },
};
