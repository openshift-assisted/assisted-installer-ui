import { commonActions } from '../../views/common';
import { clusterDetailsPage } from '../../views/clusterDetails';
import * as utils from '../../support/utils';

describe(`Assisted Installer Multinode Cluster Installation`, () => {
  const startTestWithSignal = (activeSignal: string) => {
    cy.setTestingEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };

  before(() => startTestWithSignal(''));

  beforeEach(() => {
    startTestWithSignal('');
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
      commonActions.toNextStepAfter('Cluster details');
      cy.wait('@create-cluster');
      cy.wait('@create-infra-env');
      utils.setLastWizardSignal('CLUSTER_CREATED');

      commonActions.toNextStepAfter('Operators');
    });
  });
});
