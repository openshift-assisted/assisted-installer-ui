import { commonActions } from '../../views/common';
import { clusterDetailsPage } from '../../views/clusterDetails';
import * as utils from '../../support/utils';
import { transformBasedOnUIVersion } from '../../support/transformations';

describe(`Assisted Installer Multinode Cluster Installation`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: '',
      activeScenario: 'AI_CREATE_MULTINODE',
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

      commonActions.getInfoAlert().should('not.exist');
      commonActions.waitForNext();
      commonActions.clickNextButton();

      cy.wait('@create-cluster');
      cy.wait('@create-infra-env');
      utils.setLastWizardSignal('CLUSTER_CREATED');

      commonActions.waitForNext();
      commonActions.clickNextButton();

      cy.get('h2').should('contain', 'Host discovery');
    });
  });
});
