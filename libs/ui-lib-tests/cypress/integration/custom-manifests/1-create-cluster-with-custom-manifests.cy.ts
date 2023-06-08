import { commonActions } from '../../views/common';
import { clusterDetailsPage } from '../../views/clusterDetails';
import { transformBasedOnUIVersion } from '../../support/transformations';

describe(`Assisted Installer Cluster Installation with Custom Manifests`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: '',
      activeScenario: 'AI_CREATE_CUSTOM_MANIFESTS',
    });
    transformBasedOnUIVersion();
    cy.visit('/clusters');
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null, false);
  });

  describe('Creating a new cluster', () => {
    it('Can submit the form to create a new cluster with custom manifests enabled', () => {
      commonActions.visitNewClusterPage();

      clusterDetailsPage.inputClusterName();
      clusterDetailsPage.inputbaseDnsDomain();
      clusterDetailsPage.inputOpenshiftVersion();

      clusterDetailsPage.inputPullSecret();
      clusterDetailsPage.enableCustomManifests();
      commonActions.getInfoAlert().should('contain', 'This is an advanced configuration feature.');
      commonActions.getWizardStepNav('Custom manifests').should('exist');
      commonActions.waitForNext();
      commonActions.clickNextButton();
    });
  });
});
