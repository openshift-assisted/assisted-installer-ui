import { clusterDetailsPage } from '../../views/clusterDetails';
import { commonActions } from '../../views/common';
import { dummyStaticNetworkConfig } from '../../fixtures/static-ip/static-network-config';
import * as utils from '../../support/utils';

describe(`Assisted Installer Day2 static IP flow`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'DAY2_FLOW',
    });
  };

  const openAddHostsWizard = () => {
    cy.visit('/day2-flow-mock');
    cy.window().then((win) => {
      win.__app__.OCM.Api.setAuthInterceptor((client) => client);
    });

    cy.findByRole('button', { name: 'Add hosts (With metrics)' }).click();
    cy.wait('@day2-cluster-details');
    cy.findByRole('button', { name: 'Add hosts' }).click();
  };

  describe('When no static IP is configured yet', () => {
    beforeEach(() => {
      setTestStartSignal('CREATED_DAY2_CLUSTER');
      openAddHostsWizard();
    });

    it('Can select the static IP network configuration', () => {
      clusterDetailsPage.getStaticIpNetworkConfig().check();

      commonActions.getNextButton().should('be.enabled').click();

      cy.wait('@update-day2-infra-env').then(({ request }) => {
        expect(request.body.static_network_config, 'Static IP request body').to.deep.equal(
          dummyStaticNetworkConfig,
        );
      });
      commonActions.verifyIsAtStep('Static network configurations');
    });
  });

  describe('When static IP is already configured', () => {
    beforeEach(() => {
      setTestStartSignal('DAY2_STATIC_IP_CONFIGURED');
      openAddHostsWizard();
    });

    it('Preselects static IP and can access the static IP configuration steps', () => {
      clusterDetailsPage.getStaticIpNetworkConfig().should('be.checked');
      commonActions.getNextButton().should('be.enabled').click();

      commonActions.verifyIsAtStep('Static network configurations');
      commonActions.verifyIsAtSubStep('Network-wide configurations');
    });

    it('Keeps static IP selected when returning to the Cluster details step', () => {
      commonActions.getNextButton().should('be.enabled').click();
      commonActions.verifyIsAtStep('Static network configurations');

      commonActions.getWizardStepNav('Cluster details').click();
      commonActions.verifyIsAtStep('Cluster details');

      clusterDetailsPage.getStaticIpNetworkConfig().should('be.checked');
    });
  });
});
