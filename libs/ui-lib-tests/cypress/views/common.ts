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
  getNextButton: () => {
    return cy.get('button[name="next"]');
  },
  getWizardStepNav: (stepName: string) => {
    return cy.get('.pf-v6-c-wizard__nav-item').contains(stepName);
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
    commonActions.getNextButton().should('be.enabled').click();
    commonActions.verifyIsAtStep(wizardSteps[currentIndex + 1]);
  },
  toNextStaticIpStepAfter: (fromStep: Day1StaticIpSteps) => {
    const currentIndex = wizardStepsWithStaticIp.findIndex((step) => step === fromStep);
    commonActions.getNextButton().should('be.enabled').click();

    commonActions.verifyIsAtSubStep(wizardStepsWithStaticIp[currentIndex + 1]);
  },
  toNextDay2StepAfter: (fromStep: Day2Steps) => {
    const currentIndex = day2WizardSteps.findIndex((step) => step === fromStep);

    commonActions.getNextButton().should('be.enabled').click();
    cy.get('.pf-v6-c-wizard__main-body').within(() => {
      commonActions.verifyIsAtStep(day2WizardSteps[currentIndex + 1]);
    });
  },
  verifyIsAtStep: (stepTitle: string) => {
    cy.get('h2', { timeout: 3000 }).should('contain.text', stepTitle);
  },
  verifyIsAtSubStep: (subStepTitle: string) => {
    cy.get('h3', { timeout: 2000 }).should('contain.text', subStepTitle);
  },
  verifyNextIsEnabled: () => {
    commonActions.getNextButton().should('be.enabled');
  },
  verifyNextIsDisabled: () => {
    commonActions.getNextButton().should('be.disabled');
  },
  getInfoAlert: () => {
    return cy.get('.pf-v6-c-alert.pf-m-inline.pf-m-info');
  },
  getWarningAlert: () => {
    return cy.get('.pf-v6-c-alert.pf-m-inline.pf-m-warning');
  },
  getDangerAlert: () => {
    return cy.get('.pf-v6-c-alert.pf-m-inline.pf-m-danger');
  },
  getDNSErrorMessage: () => {
    return cy.get('#form-input-dns-field-helper-error');
  },
  visitNewClusterPage: () => {
    cy.visit('/assisted-installer/clusters/~new');
  },
  visitClusterDetailsPage: () => {
    cy.visit(`/assisted-installer/clusters/${Cypress.env('clusterId')}`);
    cy.get('h2').should('exist');
  },
};
