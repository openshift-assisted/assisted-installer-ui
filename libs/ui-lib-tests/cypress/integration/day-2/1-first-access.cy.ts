import { day2FlowIds } from '../../fixtures';
import { setLastWizardSignal } from '../../support/utils';

describe(`Day2 flow`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'DAY2_FLOW',
    });
  };

  before(() => {
    setTestStartSignal('CLUSTER_FINISHED_INSTALLATION');
  });

  beforeEach(() => {
    setTestStartSignal('CLUSTER_FINISHED_INSTALLATION');
    cy.visit('/day2-flow-mock');
    cy.window().then((win) => {
      win.__app__.OCM.setAuthInterceptor((client) => client);
    });
  });

  describe('Add hosts tab - error states', () => {
    it('Shows an error if the cluster has no metrics yet', () => {
      cy.findByRole('tabpanel').should('not.exist');
      cy.findByRole('button', { name: 'Add hosts (No metrics)' }).click();
      cy.findByText('Neither API nor Console URL has been reported by the cluster yet.', {
        timeout: 500,
      }).should('be.visible');
    });

    it('Loads the infraEnv associated to the OCM cluster', () => {
      cy.findByRole('tabpanel').should('not.exist');
      cy.findByRole('button', { name: 'Add hosts (No metrics)' }).click();
      cy.wait('@find-day2-flow-infra-envs').then(({ request }) => {
        expect(request.query.cluster_id).to.equal(day2FlowIds.day1.ocmClusterId);
      });
    });

    it('Creates a Day2 cluster when the cluster has metrics', () => {
      Cypress.env('OPENSHIFT_VERSIONS_DELAY', true);

      cy.findByRole('button', { name: 'Add hosts (With metrics)' }).click();
      cy.wait('@create-day2-cluster').then(() => {
        setLastWizardSignal('CREATED_DAY2_CLUSTER');
      });

      cy.get('@create-day2-cluster.all').should('have.length', 1);
      cy.findByLabelText('Hosts table', { selector: '[role=grid]' }).should('be.visible');
    });
  });
});
