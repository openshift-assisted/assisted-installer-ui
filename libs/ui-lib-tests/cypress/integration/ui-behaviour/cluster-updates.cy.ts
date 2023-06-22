import { navbar } from '../../views/navbar';
import { transformBasedOnUIVersion } from '../../support/transformations';
import { commonActions } from '../../views/common';
import { operatorsPage } from '../../views/operatorsPage';

describe('Assisted Installer UI behaviour - cluster updates', () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: 'READY_TO_INSTALL',
      activeScenario: 'AI_CREATE_MULTINODE',
    });
    transformBasedOnUIVersion();
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    commonActions.visitClusterDetailsPage();
  });

  afterEach(() => {
    Cypress.env('AI_FORBIDDEN_CLUSTER_PATCH', false);
  });

  describe('Prevent invalid PATCH requests', () => {
    it('Should not update a cluster when no changes were done by the user', () => {
      Cypress.env('AI_FORBIDDEN_CLUSTER_PATCH', true);

      navbar.clickOnNavItem('Cluster details');
      commonActions.clickNextButton();
      commonActions.clickNextButton();
      commonActions.getHeader('h2').should('contain', 'Host discovery');
    });
  });

  describe('Should correctly behave on error responses', () => {
    it('Should get an indismissible error and a disabled Next button', () => {
      Cypress.env('AI_ERROR_CLUSTER_PATCH', true);

      navbar.clickOnNavItem('Operators');
      operatorsPage.openshiftVirtualization().click();
      cy.wait('@update-cluster').then(() => {
        commonActions.getDangerAlert().should('exist');
        commonActions.getDangerAlert().within(() => {
          cy.get('button').should('not.exist');
        });
        commonActions.getNextButton().should('be.disabled');
      });
    });
  });
});
