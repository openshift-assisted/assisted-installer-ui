import { navbar } from '../../views/navbar';
import { commonActions } from '../../views/common';
import { operatorsPage } from '../../views/operatorsPage';

describe('Assisted Installer UI behaviour - cluster updates', () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };

  before(() => setTestStartSignal('READY_TO_INSTALL'));

  beforeEach(() => {
    setTestStartSignal('READY_TO_INSTALL');
    commonActions.visitClusterDetailsPage();
  });

  afterEach(() => {
    Cypress.env('AI_FORBIDDEN_CLUSTER_PATCH', false);
    Cypress.env('AI_ERROR_CLUSTER_PATCH', false);
  });

  describe('Prevent invalid PATCH requests', () => {
    it('Should not update a cluster when no changes were done by the user', () => {
      Cypress.env('AI_FORBIDDEN_CLUSTER_PATCH', true);

      navbar.clickOnNavItem('Cluster details');
      commonActions.moveNextSteps(['Cluster details', 'Operators']);
    });
  });

  describe('Should correctly behave on error responses', () => {
    it('Should get an indismissible error and a disabled Next button', () => {
      Cypress.env('AI_ERROR_CLUSTER_PATCH', true);

      navbar.clickOnNavItem('Operators');
      operatorsPage.singleOperatorsToggle().click();
      operatorsPage.openshiftVirtualization().click();
      cy.wait('@update-cluster').then(() => {
        commonActions.getDangerAlert().should('exist');
        commonActions.getDangerAlert().within(() => {
          cy.get('button').should('not.exist');
        });
        commonActions.verifyNextIsDisabled();
      });
    });
  });
});
