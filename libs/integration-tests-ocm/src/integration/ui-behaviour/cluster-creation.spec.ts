import { transformBasedOnUIVersion } from '../../support/transformations';
import { commonActions } from '../../views/common';
import { clusterDetailsPage } from '../../views/clusterDetails';
import * as versionsFixtures from '../../fixtures/infra-envs/openshift-versions';
import { arm64, x86 } from '../../fixtures/infra-envs/openshift-versions';

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
      clusterDetailsPage.getOpenshiftVersionDropdown().find('[role="menuitem"]').each((versionItem, index) => {
        expect(versionItem).to.have.id(expectedVersionIds[index]);
      });
    });

    it('Should show when a version is beta', () => {
      commonActions.visitNewClusterPage();
      clusterDetailsPage.inputOpenshiftVersion('4.12');
      cy.get('.pf-c-helper-text').contains('production-ready').should('exist');

      clusterDetailsPage.inputOpenshiftVersion('4.11');
      cy.get('.pf-c-helper-text').contains('production-ready').should('not.exist');
    });

    it('Should activate ARM architecture only for the versions that support it', () => {
      commonActions.visitNewClusterPage();

      clusterDetailsPage.inputOpenshiftVersion(versionsFixtures.getVersionWithNoArmSupport());
      clusterDetailsPage.openCpuArchitectureDropdown();
      clusterDetailsPage.checkDisabledCpuArchitectureStatus(arm64, true);
      clusterDetailsPage.checkDisabledCpuArchitectureStatus(x86, false);
      clusterDetailsPage.selectCpuArchitecture(x86);

      clusterDetailsPage.inputOpenshiftVersion(versionsFixtures.getVersionWithArmSupport());
      clusterDetailsPage.openCpuArchitectureDropdown();
      clusterDetailsPage.checkDisabledCpuArchitectureStatus(arm64, false);
      clusterDetailsPage.checkDisabledCpuArchitectureStatus(x86, false);
      clusterDetailsPage.selectCpuArchitecture(arm64);
    });
  });
});
