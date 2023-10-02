import { commonActions } from '../../views/pages/common';
import { bareMetalDiscoveryPage } from '../../views/forms/HostDiscovery/bareMetalDiscovery';
import { bareMetalDiscoveryIsoModal } from '../../views/forms/HostDiscovery/bareMetalDiscoveryIsoModal';
import { navbar } from '../../views/pages/navbar';
import * as utils from '../../support/utils';
import { hostsTableSection } from '../../views/reusableComponents/hostsTableSection';

describe(`Assisted Installer SNO Host discovery`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_SNO',
    });
  };

  before(() => setTestStartSignal('CLUSTER_CREATED'));

  describe('Downloading the Discovery ISO', () => {
    beforeEach(() => {
      setTestStartSignal('CLUSTER_CREATED');
      commonActions.visitClusterDetailsPage();
    });

    it('Should generate discovery ISO and wait for generate to complete', () => {
      bareMetalDiscoveryPage.getAddHostsButton().should('contain.text', 'Add host');
      bareMetalDiscoveryPage.openAddHostsModal();

      bareMetalDiscoveryIsoModal.getGenerateDiscoveryIso().click();
      bareMetalDiscoveryIsoModal.waitForIsoGeneration();
      bareMetalDiscoveryIsoModal.verifyDownloadIsoLinks();

      cy.wait('@update-cluster').then(() => {
        utils.setLastWizardSignal('ISO_DOWNLOADED');
      });
      bareMetalDiscoveryIsoModal.getCloseIsoButton().click();
    });

    it('Should populate the host table when the host is discovered', () => {
      navbar.navItemsShouldNotShowErrors();

      utils.setLastWizardSignal('HOST_DISCOVERED_1');

      bareMetalDiscoveryPage.waitForHostTablePopulation();
      bareMetalDiscoveryPage.waitForHostRowToContain('localhost');
      hostsTableSection.waitForHardwareStatus('Insufficient');
    });
  });
  describe('When the host is discovered', () => {
    beforeEach(() => {
      setTestStartSignal('HOST_DISCOVERED_1');
      commonActions.visitClusterDetailsPage();
    });

    it('Should rename the host, get valid state and see the "next" button enabled', () => {
      bareMetalDiscoveryPage.selectHostRowKebabAction(
        0,
        Cypress.env('hostRowKebabMenuChangeHostnameText'),
      );

      const renamedHost = Cypress.env('HOST_RENAME');
      bareMetalDiscoveryPage.renameHost(renamedHost);
      bareMetalDiscoveryPage.clickSaveEditHostsForm();

      cy.wait('@rename-host-1').then(() => {
        utils.setLastWizardSignal('HOST_RENAMED_1');
      });

      bareMetalDiscoveryPage.waitForHostRowToContain(renamedHost);
      hostsTableSection.waitForHardwareStatus('Ready');
      bareMetalDiscoveryPage.waitForHostTablePopulation(1, 0);

      commonActions.verifyNextIsEnabled();
    });
  });
});
