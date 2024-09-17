import { commonActions } from '../../../views/common';
import { clusterDetailsPage } from '../../../views/clusterDetails';
import * as versionsFixtures from '../../../fixtures/infra-envs/openshift-versions';
import { customOCPModal } from '../../../views/customOCPModal';

describe('Assisted Installer UI behaviour - cluster creation with custom OCP releases', () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: '',
    });
  };

  before(() => setTestStartSignal(''));

  beforeEach(() => {
    setTestStartSignal('');
    cy.visit('/assisted-installer/clusters');
  });

  describe('Custom OpenShiftVersion tests', () => {
    it('Should show "Show all available versions" link inside OpenshiftVersion dropdown and open the custom OCP modal', () => {
      commonActions.visitNewClusterPage();
      clusterDetailsPage.openOpenshiftVersionDropdown();
      clusterDetailsPage.clickLinkAllAvailableVersions();
      customOCPModal.getCustomOCPModalId().should('be.visible');
    });

    it('Should enter a text to search OCP version and some results are returned', () => {
      commonActions.visitNewClusterPage();
      clusterDetailsPage.openOpenshiftVersionDropdown();
      clusterDetailsPage.clickLinkAllAvailableVersions();
      customOCPModal.getCustomOCPModalId().should('be.visible');
      customOCPModal.inputVersionToSearch('4.16');
      customOCPModal.getSearchResponse('4.16');
    });

    it('Should enter a text to search OCP version and no results are found', () => {
      commonActions.visitNewClusterPage();
      clusterDetailsPage.openOpenshiftVersionDropdown();
      clusterDetailsPage.clickLinkAllAvailableVersions();
      customOCPModal.getCustomOCPModalId().should('be.visible');
      customOCPModal.inputVersionToSearch('4--');
      customOCPModal.getSearchResponse('No results found');
    });

    it('Should search a custom OCP version and is shown in the Openshift dropdown modal', () => {
      commonActions.visitNewClusterPage();
      clusterDetailsPage.openOpenshiftVersionDropdown();
      clusterDetailsPage.clickLinkAllAvailableVersions();
      customOCPModal.getCustomOCPModalId().should('be.visible');
      customOCPModal.inputVersionToSearch('4.14.16');
      customOCPModal.selectFirstSearchResponse('4.14.16');
      customOCPModal.getSelectModalButton().click();
      clusterDetailsPage.getSelectedOpenShiftVersion().should('contain.text', `OpenShift 4.14.16`);
      customOCPModal.getCustomOCPModalId().should('not.exist');
    });

    it('Should close custom OCP modal with "Cancel" button', () => {
      commonActions.visitNewClusterPage();
      clusterDetailsPage.openOpenshiftVersionDropdown();
      clusterDetailsPage.clickLinkAllAvailableVersions();
      customOCPModal.getCloseModalButton().click();
      customOCPModal.getCustomOCPModalId().should('not.exist');
    });

    it('Should close custom OCP modal with "X" button', () => {
      commonActions.visitNewClusterPage();
      clusterDetailsPage.openOpenshiftVersionDropdown();
      clusterDetailsPage.clickLinkAllAvailableVersions();
      customOCPModal.getCloseModalIcon().click();
      customOCPModal.getCustomOCPModalId().should('not.exist');
    });
  });
});
