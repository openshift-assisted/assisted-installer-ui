import { commonActions } from '../../views/common';
import { clusterDetailsPage } from '../../views/clusterDetails';

describe(`Assisted Installer Cluster Installation with Custom Manifests`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: '',
      activeScenario: 'AI_CREATE_CUSTOM_MANIFESTS',
    });
    cy.visit('/clusters');
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null, false);
  });

  describe('Creating a new cluster', () => {
    it('Can submit the form to create a new cluster with custom manifests enabled', () => {
      commonActions.visitNewClusterPage();

      clusterDetailsPage.inputClusterName();
      clusterDetailsPage.inputBaseDnsDomain();
      clusterDetailsPage.inputOpenshiftVersion();

      clusterDetailsPage.inputPullSecret();
      clusterDetailsPage.getCustomManifestCheckbox().should('be.visible').check();
      clusterDetailsPage.getCustomManifestCheckbox().should('be.checked');
      commonActions
        .getInfoAlert()
        .should('contain.text', 'This is an advanced configuration feature.');
      commonActions.getWizardStepNav('Custom manifests').should('exist');
      commonActions.waitForNext();
      commonActions.clickNextButton();
    });
  });
});
