import { commonActions } from '../../views/common';
import { clusterDetailsPage } from '../../views/clusterDetails';
import * as utils from '../../support/utils';
import { transformBasedOnUIVersion } from '../../support/transformations';
import { dummyStaticNetworkConfig } from '../../fixtures/static-ip/static-network-config';

describe(`Assisted Installer Static IP Cluster Creation`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: '',
      activeScenario: 'AI_CREATE_STATIC_IP',
    });
    transformBasedOnUIVersion();
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    cy.visit('/clusters');
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
      commonActions.waitForNext();
      commonActions.clickNextButton();

      cy.wait('@create-cluster');
      cy.wait('@create-infra-env').then(({ request }) => {
        expect(request.body.static_network_config, 'Static IP request body').to.deep.equal(dummyStaticNetworkConfig);
        utils.setLastWizardSignal('CLUSTER_CREATED');
      });

      cy.get('h2').should('contain', 'Static network configurations');
    });
  });
});
