import { commonActions } from '../../views/common';
import { bareMetalDiscoveryPage } from '../../views/bareMetalDiscovery';
import { bareMetalDiscoveryIsoModal } from '../../views/bareMetalDiscoveryIsoModal';
import { hostsTableSection } from '../../views/hostsTableSection';
import { navbar } from '../../views/navbar';

import * as utils from '../../support/utils';

const validateHostTableDetails = () => {
  Cypress.env('masterCPU', '8');
  Cypress.env('masterMemory', '33.20 GiB');
  Cypress.env('masterDiskTotalSize', '12.88 GB');

  hostsTableSection.validateHostCpuCores(3, 0);
  hostsTableSection.validateHostDiskSize(3, 0);
  hostsTableSection.validateHostMemory(3, 0);
  hostsTableSection.validateHostRoles(3, 0);
};

describe(`Assisted Installer Multinode Host discovery`, () => {
  const startTestWithSignal = (activeSignal: string) => {
    cy.setTestingEnvironment({
      activeSignal: activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };

  before(() => startTestWithSignal('CLUSTER_CREATED'));

  beforeEach(() => {
    startTestWithSignal('CLUSTER_CREATED');
    commonActions.visitClusterDetailsPage();
  });

  describe('Downloading the Discovery ISO', () => {
    it('Should generate discovery ISO and wait for generate to complete', () => {
      bareMetalDiscoveryPage.getAddHostsButton().should('contain.text', 'Add hosts');
      bareMetalDiscoveryPage.openAddHostsModal();

      bareMetalDiscoveryIsoModal.getGenerateDiscoveryIso().click();
      bareMetalDiscoveryIsoModal.getGeneratingButton().should('be.visible');
      bareMetalDiscoveryIsoModal.waitForIsoGeneration();
      bareMetalDiscoveryIsoModal.verifyDownloadIsoLinks();

      cy.wait('@update-cluster').then(() => {
        utils.setLastWizardSignal('ISO_DOWNLOADED');
      });
      bareMetalDiscoveryIsoModal.getCloseIsoButton().click();
    });

    it('Instructions should appear inside the Add Host modal', () => {
      bareMetalDiscoveryIsoModal.getAddHostsButton().click();
      bareMetalDiscoveryIsoModal.getGenerateDiscoveryIso().click();
      bareMetalDiscoveryIsoModal.getAddHostsInstructions().should('exist');
    });

    it('Should populate the host table when hosts are discovered', () => {
      navbar.navItemsShouldNotShowErrors();
      utils.setLastWizardSignal('HOST_DISCOVERED_3');

      bareMetalDiscoveryPage.waitForHostTablePopulation(3, 0);
      validateHostTableDetails();
    });
  });

  describe('When all hosts are discovered', () => {
    beforeEach(() => {
      startTestWithSignal('HOST_DISCOVERED_3');
    });

    it('Should mass-rename the hosts and be able to continue', () => {
      const hostPrefix = Cypress.env('HOST_RENAME');
      bareMetalDiscoveryPage.waitForHostTablePopulation(3, 0);
      bareMetalDiscoveryPage.massRenameHosts(hostPrefix);
      cy.wait(['@rename-host-1', '@rename-host-2', '@rename-host-3']).then(() => {
        utils.setLastWizardSignal('HOST_RENAMED_3');
        hostsTableSection.waitForHardwareStatus('Ready');
        hostsTableSection.validateHostNames(3, 0, [
          `${hostPrefix}-1`,
          `${hostPrefix}-2`,
          `${hostPrefix}-3`,
        ]);
      });
      commonActions.verifyNextIsEnabled();
    });
  });
});
