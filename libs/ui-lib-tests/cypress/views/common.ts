import * as utils from '../support/utils';

const wizardSteps = [
  'Cluster details',
  'Operators',
  'Host discovery',
  'Storage',
  'Networking',
  'Review and create',
];

const wizardStepsWithStaticIp = [
  'Cluster details',
  'Network-wide configurations',
  'Host specific configurations',
  'Operators',
  'Host discovery',
  'Storage',
  'Networking',
  'Review and create',
];

const day2WizardSteps = ['Cluster details', 'Generate Discovery ISO', 'Download Discovery ISO'];

type Day1Steps =
  | 'Cluster details'
  | 'Host discovery'
  | 'Storage'
  | 'Networking'
  | 'Review and create'
  | 'Operators';

type Day1StaticIpSteps =
    | 'Cluster details'
    | 'Network-wide configurations'
    | 'Host specific configurations'
    | 'Host discovery';

type Day2Steps = 'Cluster details' | 'Generate Discovery ISO' | 'Download Discovery ISO';

export const commonActions = {
  getWizardStepNav: (stepName: string) => {
    return cy.get('.pf-c-wizard__nav-item').contains(stepName);
  },
  toNextStepAfter: (fromStep: Day1Steps) => {
    const currentIndex = wizardSteps.findIndex((step) => step === fromStep);
    cy.get(Cypress.env('nextButton')).should('be.enabled').click();
    commonActions.validateIsAtStep(wizardSteps[currentIndex + 1]);
  },
  toNextStaticIpStepAfter: (fromStep: Day1StaticIpSteps) => {
    const currentIndex = wizardStepsWithStaticIp.findIndex((step) => step === fromStep);
    cy.get(Cypress.env('nextButton')).should('be.enabled').click();

    commonActions.validateIsAtSubStep(wizardStepsWithStaticIp[currentIndex + 1]);
  },
  toNextDay2StepAfter: (fromStep: Day2Steps) => {
    const currentIndex = day2WizardSteps.findIndex((step) => step === fromStep);

    cy.get(Cypress.env('nextButton')).should('be.enabled').click();
    cy.get('.pf-c-wizard__main-body').within(() => {
      commonActions.validateIsAtStep(day2WizardSteps[currentIndex + 1]);
    });
  },
  validateIsAtStep: (stepTitle: string) => {
    cy.get('h2', { timeout: 2000 }).should('contain.text', stepTitle);
  },
  validateIsAtSubStep: (subStepTitle: string) => {
    cy.get('h3', { timeout: 2000 }).should('contain.text', subStepTitle);
  },
  validateNextIsEnabled: () => {
    cy.get(Cypress.env('nextButton')).should('be.enabled');
  },
  validateNextIsDisabled: () => {
    cy.get(Cypress.env('nextButton')).should('be.disabled');
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
    cy.get('h2').should('exist');
  },
  verifyIsAtStep: (stepTitle: string, timeout?: number) => {
    cy.get('h2', { timeout }).should('contain.text', stepTitle);
  },
  verifyIsAtSubStep: (stepTitle: string, timeout?: number) => {
    cy.get('h3', { timeout }).should('contain.text', stepTitle);
  },
  startAtCustomManifestsStep: () => {
    commonActions.getWizardStepNav('Custom manifests').click();
    commonActions.validateIsAtStep('Custom manifests');
  },
  startAtOperatorsStep: () => {
    commonActions.getWizardStepNav('Operators').click();
    commonActions.validateIsAtStep('Operators');
  },
  startAtStorageStep: () => {
    commonActions.getWizardStepNav('Storage').click();
    commonActions.validateIsAtStep('Storage');
  },
  startAtNetworkingStepFrom: (fromStep: 'Host discovery' | 'Storage' = 'Host discovery') => {
    if (utils.hasWizardSignal('READY_TO_INSTALL')) {
      commonActions.getWizardStepNav('Networking').click();
    } else {
      if (fromStep === 'Host discovery') {
        commonActions.toNextStepAfter(fromStep);
      }
      commonActions.toNextStepAfter('Storage');
    }
    commonActions.validateIsAtStep('Networking');
  },
};
