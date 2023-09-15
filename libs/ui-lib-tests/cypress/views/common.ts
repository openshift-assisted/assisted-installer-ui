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
  | 'Operators'
  | 'Custom manifests';

type Day1StaticIpSteps =
  | 'Cluster details'
  | 'Network-wide configurations'
  | 'Host specific configurations'
  | 'Host discovery';

type Day2Steps = 'Cluster details' | 'Generate Discovery ISO' | 'Download Discovery ISO';

type Steps = Day1Steps | Day1StaticIpSteps | Day2Steps;

export const commonActions = {
  getWizardStepNav: (stepName: string) => {
    return cy.get('.pf-c-wizard__nav-item').contains(stepName);
  },
  startAtWizardStep: (step: Steps) => {
    commonActions.getWizardStepNav(step).click();
    commonActions.verifyIsAtStep(step);
  },
  moveNextSteps: (steps: Day1Steps[]) => {
    steps.forEach((step) => {
      commonActions.toNextStepAfter(step);
    });
  },
  toNextStepAfter: (fromStep: Day1Steps) => {
    const currentIndex = wizardSteps.findIndex((step) => step === fromStep);
    cy.get(Cypress.env('nextButton')).should('be.enabled').click();
    commonActions.verifyIsAtStep(wizardSteps[currentIndex + 1]);
  },
  toNextStaticIpStepAfter: (fromStep: Day1StaticIpSteps) => {
    const currentIndex = wizardStepsWithStaticIp.findIndex((step) => step === fromStep);
    cy.get(Cypress.env('nextButton')).should('be.enabled').click();

    commonActions.verifyIsAtSubStep(wizardStepsWithStaticIp[currentIndex + 1]);
  },
  toNextDay2StepAfter: (fromStep: Day2Steps) => {
    const currentIndex = day2WizardSteps.findIndex((step) => step === fromStep);

    cy.get(Cypress.env('nextButton')).should('be.enabled').click();
    cy.get('.pf-c-wizard__main-body').within(() => {
      commonActions.verifyIsAtStep(day2WizardSteps[currentIndex + 1]);
    });
  },
  verifyIsAtStep: (stepTitle: string) => {
    cy.get('h2', { timeout: 2000 }).should('contain.text', stepTitle);
  },
  verifyIsAtSubStep: (subStepTitle: string) => {
    cy.get('h3', { timeout: 2000 }).should('contain.text', subStepTitle);
  },
  verifyNextIsEnabled: () => {
    cy.get(Cypress.env('nextButton')).should('be.enabled');
  },
  verifyNextIsDisabled: () => {
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
};
