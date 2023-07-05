import { commonActions } from '../../views/common';
import { clusterDetailsPage } from '../../views/clusterDetails';
import * as versionsFixtures from '../../fixtures/infra-envs/openshift-versions';

describe('Assisted Installer UI behaviour - cluster creation', () => {
  const refreshTestSetup = () => {
    cy.setTestingEnvironment({
      activeSignal: '',
      activeScenario: '',
    });
  };

  before(refreshTestSetup);

  beforeEach(() => {
    refreshTestSetup();
    cy.visit('/clusters');
  });

  describe('OpenShiftVersion tests', () => {
    it('Should have the correct values for the Openshift versions', () => {
      commonActions.visitNewClusterPage();

      clusterDetailsPage
        .getSelectedOpenShiftVersion()
        .should('contain.text', `OpenShift ${versionsFixtures.getDefaultOpenShiftVersion()}`);

      // Checking that the submitting value (item ID) for each version is correct
      clusterDetailsPage.openOpenshiftVersionDropdown();
      const expectedVersionIds = versionsFixtures.getExpectedVersionIds();
      clusterDetailsPage
        .getOpenshiftVersionDropdown()
        .find('[role="menuitem"]')
        .each((versionItem, index) => {
          expect(versionItem.parent()).to.have.id(expectedVersionIds[index]);
        });
    });

    it('Should show when a version is beta', () => {
      commonActions.visitNewClusterPage();
      clusterDetailsPage.inputOpenshiftVersion('4.13');
      cy.get('.pf-c-helper-text').contains('production-ready').should('exist');

      clusterDetailsPage.inputOpenshiftVersion('4.12');
      cy.get('.pf-c-helper-text').contains('production-ready').should('not.exist');
    });

    it('Should activate ARM architecture only for the versions that support it', () => {
      commonActions.visitNewClusterPage();

      clusterDetailsPage.inputOpenshiftVersion(versionsFixtures.getVersionWithNoArmSupport());
      clusterDetailsPage.openCpuArchitectureDropdown();
      clusterDetailsPage.CpuArchitectureNotExists(versionsFixtures.arm64);
      clusterDetailsPage.CpuArchitectureExists(versionsFixtures.x86);
      clusterDetailsPage.selectCpuArchitecture(versionsFixtures.x86);

      clusterDetailsPage.inputOpenshiftVersion(versionsFixtures.getVersionWithArmSupport());
      clusterDetailsPage.openCpuArchitectureDropdown();
      clusterDetailsPage.CpuArchitectureExists(versionsFixtures.arm64);
      clusterDetailsPage.CpuArchitectureExists(versionsFixtures.x86);
      clusterDetailsPage.selectCpuArchitecture(versionsFixtures.arm64);
    });
  });
});
