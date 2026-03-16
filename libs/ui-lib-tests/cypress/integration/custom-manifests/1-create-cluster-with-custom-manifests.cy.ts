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

      commonActions.getWizardStepNav('Custom manifests').should('exist');

      commonActions.getNextButton().click();
    });
  });
});
