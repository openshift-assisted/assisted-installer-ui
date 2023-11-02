import { clusterDetailsPage } from '../../views/clusterDetails';
import { commonActions } from '../../views/common';

describe(`Assisted Installer Day2 flow`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'DAY2_FLOW',
    });
  };

  before(() => {
    setTestStartSignal('CREATED_DAY2_CLUSTER');
  });

  beforeEach(() => {
    setTestStartSignal('CREATED_DAY2_CLUSTER');
    cy.visit('/day2-flow-mock');
    cy.window().then((win) => {
      win.__app__.OCM.Api.setAuthInterceptor((client) => client);
    });
    cy.findByRole('button', { name: 'Add hosts (With metrics)' }).click();
    cy.wait('@day2-cluster-details');
  });

  describe('After cluster installed', () => {
    it('Opens the Add hosts modal when clicking on the "Add hosts" button', () => {
      cy.findByRole('button', { name: 'Add hosts' }).click();

      cy.findByRole('dialog').should('be.visible');
    });

    it('Can select the default CPU architecture and move next', () => {
      cy.findByRole('button', { name: 'Add hosts' }).click();

      commonActions.toNextDay2StepAfter('Cluster details');

      cy.wait('@update-day2-infra-env').then(({ request }) => {
        // TODO ADD the assertion for the cpu architecture (infraEnv Id), or use the alias in the interceptor
        expect(request.body).to.deep.equal({ static_network_config: [] });
      });
    });

    it('Can select a different CPU architecture and move next', () => {
      cy.findByRole('button', { name: 'Add hosts' }).click();

      clusterDetailsPage.openCpuArchitectureDropdown();
      clusterDetailsPage.selectCpuArchitecture('arm64');

      commonActions.toNextDay2StepAfter('Cluster details');

      cy.wait('@update-day2-infra-env').then(({ request }) => {
        // TODO ADD the assertion for the cpu architecture (infraEnv Id), or use the alias in the interceptor
        expect(request.body).to.deep.equal({ static_network_config: [] });
      });
    });
  });
});
