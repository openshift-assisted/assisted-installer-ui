import { commonActions } from '../../views/common';
import { clusterDetailsPage } from '../../views/clusterDetails';
import { clusterListPage } from '../../views/clusterList';
import * as utils from '../../support/utils';

describe(`Assisted Installer SNO Cluster Installation`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: '',
      activeScenario: 'AI_CREATE_SNO',
    });
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    cy.visit('/clusters');
  });

  describe('Creating a new cluster', () => {
    it('Can go to New Cluster Wizard', () => {
      clusterListPage.getCreateNewClusterButton().should('be.visible');
      clusterListPage.getCreateNewClusterButton().click();

      cy.location('pathname').should('eq', Cypress.env('newClusterLocation'));
    });

    it('Can submit the form to create a new cluster', () => {
      commonActions.visitNewClusterPage();

      clusterDetailsPage.inputClusterName();
      clusterDetailsPage.inputBaseDnsDomain();
      clusterDetailsPage.inputOpenshiftVersion();

      clusterDetailsPage.enableSno();
      clusterDetailsPage.inputPullSecret();

      // Create the cluster and store its ID when moving to the next step
      commonActions.toNextStepAfter('Cluster details');

      cy.wait('@create-cluster');
      cy.wait('@create-infra-env');
      utils.setLastWizardSignal('CLUSTER_CREATED');

      commonActions.toNextStepAfter('Operators');
    });

    it('Show the dev-preview badge for SNO', () => {
      commonActions.visitNewClusterPage();
      clusterDetailsPage.inputOpenshiftVersion('4.8');
      clusterDetailsPage.enableSno();
      commonActions
        .getWarningAlert()
        .should('contain.text', 'Limitations for using Single Node OpenShift');
    });

    it('Lists the new cluster', () => {
      clusterListPage.getClusterByName().should('be.visible');
    });
  });
});
