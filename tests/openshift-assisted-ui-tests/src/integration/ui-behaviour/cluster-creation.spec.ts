import { transformBasedOnUIVersion } from '../../support/transformations';
import { commonActions } from '../../views/common';
import { clusterDetailsPage } from '../../views/clusterDetails';
import * as versionsFixtures from '../../fixtures/infra-envs/openshift-versions';

describe('Assisted Installer UI behaviour - cluster creation', () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: '',
      activeScenario: '',
    });
    transformBasedOnUIVersion();
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    cy.visit('/clusters');
  });

  describe('OpenShiftVersion tests', () => {
    it('Should have the correct values for the Openshift versions', () => {
      commonActions.visitNewClusterPage();

      clusterDetailsPage.getSelectedOpenShiftVersion() .should(
        'contain',
        `OpenShift ${versionsFixtures.getDefaultOpenShiftVersion()}`,
      );

      // Checking that the submitting value (item ID) for each version is correct
      clusterDetailsPage.openOpenshiftVersionDropdown();

      const expectedVersionIds = versionsFixtures.getExpectedVersionIds();
      clusterDetailsPage.getOpenshiftVersionDropdown().find('li').each((versionItem, index) => {
        expect(versionItem).to.have.id(expectedVersionIds[index]);
      });
    });

    it('Should activate ARM architecture only for the versions that support it', () => {
      commonActions.visitNewClusterPage();

      clusterDetailsPage.inputOpenshiftVersion(versionsFixtures.getVersionWithNoArmSupport());
      clusterDetailsPage.getArmCpuArchitectureField().should('be.disabled');

      clusterDetailsPage.inputOpenshiftVersion(versionsFixtures.getVersionWithArmSupport());
      clusterDetailsPage.getArmCpuArchitectureField().should('be.enabled');
    });
  });
});
