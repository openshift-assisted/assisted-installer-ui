import { commonActions } from '../../views/common';
import { navbar } from '../../views/navbar';

describe('Assisted Installer UI behaviour - cluster updates', () => {
    describe('Cypress loading', () => {
        beforeEach(() => {
            cy.loadAiAPIIntercepts(null);
        })
        it('Should have loaded any page', () => {
            cy.visit('http://localhost:3000')
            cy.get('body').should('exist');
        });

        it('Should see a list of clusters', () => {
            cy.visit('http://localhost:3000')
            cy.get('table[aria-label="Clusters table"]').should('be.visible');
            cy.get('table[aria-label="Clusters table"] tbody tr').should('have.length', 1);

            cy.get('h1').should('contain', 'Assisted Clusters');
        });
    });

    describe('Prevent invalid PATCH requests', () => {
      beforeEach(() => {
        cy.loadAiAPIIntercepts({
          activeSignal: 'READY_TO_INSTALL',
          activeScenario: 'AI_CREATE_MULTINODE',
        });
      });

      afterEach(() => {
        Cypress.env('AI_FORBIDDEN_CLUSTER_PATCH', false);
      });

      it('Should not update a cluster when no changes were done by the user', () => {
        Cypress.env('AI_FORBIDDEN_CLUSTER_PATCH', true);

        // TODO testing absolute hardcoded URL instead of the relative one
        // commonActions.visitClusterDetailsPage();
        cy.visit(`http://localhost:3000/clusters/${Cypress.env('clusterId')}`);

        navbar.clickOnNavItem('Cluster details');
        commonActions.clickNextButton();
        commonActions.clickNextButton();
        commonActions.getHeader('h2').should('contain', 'Host discovery');
      });
    });
});
