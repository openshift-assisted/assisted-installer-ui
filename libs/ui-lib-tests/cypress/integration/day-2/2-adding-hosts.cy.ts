import { transformBasedOnUIVersion } from '../../support/transformations';
import { clusterDetailsPage } from '../../views/clusterDetails';

describe(`Assisted Installer Day2 flow`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeScenario: 'DAY2_FLOW',
      activeSignal: 'CREATED_DAY2_CLUSTER',
    });
    transformBasedOnUIVersion();
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    cy.visit('/day2-flow-mock');
    cy.findByRole('button', { name: 'Add hosts (With metrics)' }).click();
  });

  describe('After cluster installed', () => {
    it('Opens the Add hosts modal when clicking on the "Add hosts" button', () => {
      cy.findByRole('button', { name: 'Add hosts' }).click();

      cy.findByRole('dialog').should('be.visible');
    });

    it('Can select the default CPU architecture and move next', () => {
      cy.findByRole('button', { name: 'Add hosts' }).click();

      cy.findByRole('button', { name: 'Next' }).click();

      cy.wait('@update-day2-infra-env').then(({ request }) => {
        // TODO ADD the assertion for the cpu architecture (infraEnv Id), or use the alias in the interceptor
        expect(request.body).to.deep.equal({ static_network_config: [] });
      });

      cy.findByText('Generate Discovery ISO').should('be.visible');
    });

    it('Can select a different CPU architecture and move next', () => {
      cy.findByRole('button', { name: 'Add hosts' }).click();

      clusterDetailsPage.openCpuArchitectureDropdown();
      clusterDetailsPage.selectCpuArchitecture('arm64');

      cy.findByRole('button', { name: 'Next' }).click();

      cy.wait('@update-day2-infra-env').then(({ request }) => {
        // TODO ADD the assertion for the cpu architecture (infraEnv Id), or use the alias in the interceptor
        expect(request.body).to.deep.equal({ static_network_config: [] });
      });

      cy.findByText('Generate Discovery ISO').should('be.visible');
    });
  });
});
