import { commonActions } from '../../views/common';
import { clusterListPage } from '../../views/clusterList';

describe('Navigation Tests', () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };

  before(() => setTestStartSignal('CLUSTER_CREATED'));

  beforeEach(() => {
    setTestStartSignal('CLUSTER_CREATED');
  });

  describe('Direct Route Navigation', () => {
    it('Should navigate to clusters list route', () => {
      cy.visit('/assisted-installer/clusters');
      cy.url().should('include', '/assisted-installer/clusters');
      clusterListPage.getCreateNewClusterButton().should('be.visible');
    });

    it('Should navigate to new cluster creation route', () => {
      cy.visit('/assisted-installer/clusters/~new');
      cy.url().should('include', '/assisted-installer/clusters/~new');
      commonActions.verifyIsAtStep('Cluster details');
    });

    it('Should navigate to cluster details route', () => {
      cy.visit(`/assisted-installer/clusters/${Cypress.env('clusterId')}`);
      cy.url().should('include', `/assisted-installer/clusters/${Cypress.env('clusterId')}`);
      commonActions.verifyIsAtStep('Host discovery');
    });
  });

  describe('Header Navigation', () => {
    it('Should navigate to clusters list when clicking masthead logo from new cluster page', () => {
      cy.visit('/assisted-installer/clusters/~new');
      cy.get('.pf-v6-c-masthead__brand a').click();
      cy.url().should('include', '/clusters');
      clusterListPage.getCreateNewClusterButton().should('be.visible');
    });

    it('Should navigate to clusters list when clicking masthead logo from cluster details page', () => {
      cy.visit(`/assisted-installer/clusters/${Cypress.env('clusterId')}`);
      cy.get('.pf-v6-c-masthead__brand a').click();
      cy.url().should('include', '/clusters');
      clusterListPage.getCreateNewClusterButton().should('be.visible');
    });
  });

  describe('Clusters List Navigation', () => {
    beforeEach(() => {
      cy.visit('/assisted-installer/clusters');
    });

    it('Should navigate to new cluster page when clicking Create Cluster button', () => {
      clusterListPage.getCreateNewClusterButton().click();
      cy.url().should('include', '/assisted-installer/clusters/~new');
      commonActions.verifyIsAtStep('Cluster details');
    });

    it('Should navigate to cluster details when clicking cluster name link', () => {
      cy.getClusterLink().click();
      cy.url().should('include', `/assisted-installer/clusters/${Cypress.env('clusterId')}`);
      commonActions.verifyIsAtStep('Host discovery');
    });
  });

  describe('Cluster Wizard Navigation', () => {
    beforeEach(() => {
      cy.visit('/assisted-installer/clusters/~new');
    });

    it('Should navigate to clusters list when clicking Cancel button in wizard footer', () => {
      cy.get('button[name="cancel"]').click();
      cy.url().should('include', '/assisted-installer/clusters');
      cy.url().should('not.include', '~new');
      clusterListPage.getCreateNewClusterButton().should('be.visible');
    });
  });

  describe('Cluster Details Navigation', () => {
    beforeEach(() => {
      cy.visit(`/assisted-installer/clusters/${Cypress.env('clusterId')}`);
    });

    it('Should navigate to clusters list when clicking breadcrumb link', () => {
      cy.get('.pf-v6-c-breadcrumb__item').contains('Assisted Clusters').click();
      cy.url().should('include', '/assisted-installer/clusters');
      cy.url().should('not.include', Cypress.env('clusterId'));
      clusterListPage.getCreateNewClusterButton().should('be.visible');
    });
  });

  describe('Error Handling & Redirects', () => {
    it('Should redirect to clusters list when navigating to invalid route', () => {
      cy.visit('/this-url/is/total-nonsense');
      cy.url().should('include', '/assisted-installer/clusters');
      cy.url().should('not.include', 'total-nonsense');
    });

    it('Should show error state with BackButton and navigate when clicked', () => {
      cy.intercept('GET', '/api/assisted-install/v2/clusters/default-config', {
        statusCode: 500,
        body: { code: 500, message: 'Internal server error' },
      }).as('get-default-config-error');

      cy.visit(`/assisted-installer/clusters/${Cypress.env('clusterId')}`);
      cy.wait('@get-default-config-error');

      cy.contains('Failed to retrieve the default configuration').should('be.visible');
      cy.get('.pf-v6-c-button').contains('Back').should('be.visible').click();

      cy.url().should('include', '/assisted-installer/clusters');
      cy.url().should('not.include', Cypress.env('clusterId'));
      clusterListPage.getCreateNewClusterButton().should('be.visible');
    });
  });
});
