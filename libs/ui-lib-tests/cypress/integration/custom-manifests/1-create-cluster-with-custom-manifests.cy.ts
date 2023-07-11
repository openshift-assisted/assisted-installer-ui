import { commonActions } from '../../views/common';
import { clusterDetailsPage } from '../../views/clusterDetails';

describe(`Assisted Installer Cluster Installation with Custom Manifests`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_CUSTOM_MANIFESTS',
    });
  };

  before(() => setTestStartSignal(''));
  beforeEach(() => setTestStartSignal(''));

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

      commonActions.toNextStepAfter('Cluster details');

      cy.wait('@create-manifest').then(({ request }) => {
        expect(request.body).to.deep.equal({
          folder: 'manifests',
          file_name: 'manifest1.yaml',
          content: '',
        });
      });
    });
  });
});
