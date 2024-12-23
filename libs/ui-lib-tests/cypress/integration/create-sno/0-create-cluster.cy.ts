import { commonActions } from '../../views/common';
import { clusterDetailsPage } from '../../views/clusterDetails';
import { clusterListPage } from '../../views/clusterList';
import * as utils from '../../support/utils';

describe(`Assisted Installer SNO Cluster Installation`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_SNO',
    });
  };

  before(() => setTestStartSignal(''));

  beforeEach(() => {
    setTestStartSignal('');
    cy.visit('/assisted-installer/clusters');
  });

  describe('Creating a new cluster', () => {
    it('Can go to New Cluster Wizard', () => {
      clusterListPage.getCreateNewClusterButton().should('be.visible');
      clusterListPage.getCreateNewClusterButton().click();

      cy.location('pathname').should('eq', '/assisted-installer/clusters/~new');
    });

    it('Can submit the form to create a new cluster', () => {
      commonActions.visitNewClusterPage();

      clusterDetailsPage.inputClusterName();
      clusterDetailsPage.inputBaseDnsDomain();
      clusterDetailsPage.inputOpenshiftVersion('4.18');

      clusterDetailsPage.openControlPlaneNodesDropdown();
      clusterDetailsPage.selectControlPlaneNodeOption('1');
      clusterDetailsPage.inputPullSecret();

      // Create the cluster and store its ID when moving to the next step
      commonActions.toNextStepAfter('Cluster details');

      cy.wait('@create-cluster');
      cy.wait('@create-infra-env');
      utils.setLastWizardSignal('CLUSTER_CREATED');

      commonActions.toNextStepAfter('Operators');
    });

    describe('When the cluster is created', () => {
      beforeEach(() => {
        setTestStartSignal('CLUSTER_CREATED');
        cy.visit('/assisted-installer/clusters');
      });

      it('Lists the new cluster', () => {
        clusterListPage.getClusterByName().should('be.visible');
      });
    });
  });
});
