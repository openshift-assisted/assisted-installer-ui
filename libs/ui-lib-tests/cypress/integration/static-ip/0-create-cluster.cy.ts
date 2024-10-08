import { commonActions } from '../../views/common';
import { clusterDetailsPage } from '../../views/clusterDetails';
import * as utils from '../../support/utils';
import { dummyStaticNetworkConfig } from '../../fixtures/static-ip/static-network-config';

describe(`Assisted Installer Static IP Cluster Creation`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_STATIC_IP',
    });
  };

  before(() => setTestStartSignal(''));

  beforeEach(() => {
    setTestStartSignal('');
    cy.visit('/assisted-installer/clusters');
  });

  describe('Creating a new cluster', () => {
    it('Can submit the form to create a new cluster', () => {
      commonActions.visitNewClusterPage();

      clusterDetailsPage.inputClusterName();
      clusterDetailsPage.getRedHatDnsServiceCheck().check();
      clusterDetailsPage.inputOpenshiftVersion();
      clusterDetailsPage.inputPullSecret();

      clusterDetailsPage.getStaticIpNetworkConfig().click();
      commonActions.getWizardStepNav('Static network configurations').should('exist');

      commonActions.getInfoAlert().should('not.exist');
      commonActions.toNextStaticIpStepAfter('Cluster details');

      cy.wait('@create-cluster');
      cy.wait('@create-infra-env').then(({ request }) => {
        expect(request.body.static_network_config, 'Static IP request body').to.deep.equal(
          dummyStaticNetworkConfig,
        );
        utils.setLastWizardSignal('CLUSTER_CREATED');
      });
    });
  });
});
