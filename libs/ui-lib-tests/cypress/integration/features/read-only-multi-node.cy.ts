import { navbar } from '../../views/navbar';
import { clusterDetailsPage } from '../../views/clusterDetails';
import { bareMetalDiscoveryPage } from '../../views/bareMetalDiscovery';
import { networkingPage } from '../../views/networkingPage';
import { reviewAndCreatePage } from '../../views/reviewCreate';
import { commonActions } from '../../views/common';
import { transformBasedOnUIVersion } from '../../support/transformations';

describe(`Assisted Installer Read Only Cluster`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: 'READY_TO_INSTALL',
      activeScenario: 'AI_READONLY_CLUSTER',
    });
    transformBasedOnUIVersion();
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    commonActions.visitClusterDetailsPage();
  });

  describe('Read Only cluster', () => {
    it('Should display the Cluster details page in viewer mode', () => {
      navbar.clickOnNavItem('Cluster details');

      clusterDetailsPage.getClusterNameField().should('be.disabled');
      clusterDetailsPage.getBaseDnsDomain().should('be.disabled');
    });

    it('Should display Operators page in viewer mode', () => {
      navbar.clickOnNavItem('Operators');
      bareMetalDiscoveryPage.getCnvField().should('be.disabled');
      bareMetalDiscoveryPage.getOdfOperator().should('be.disabled');
      bareMetalDiscoveryPage.getLvmOperator().should('not.exist');
    });

    it('Should display the Host discovery page in viewer mode', () => {
      navbar.clickOnNavItem('Host discovery');

      // General controls
      bareMetalDiscoveryPage.platformIntegration.getToggleSwitch().should('be.disabled');
      bareMetalDiscoveryPage.getAddHostsButton().should('not.exist');

      // Host Table actions
      bareMetalDiscoveryPage.getHostTableMassActions().should('not.exist');
      bareMetalDiscoveryPage.getHostRowSelectCheckbox(0).should('not.exist');
      bareMetalDiscoveryPage.validateIsReadOnlyHostMenu();
    });

    it('Should display Storage page in viewer mode', () => {
      navbar.clickOnNavItem('Storage');
      bareMetalDiscoveryPage.getHostTableMassActions().should('not.exist');
      bareMetalDiscoveryPage.validateIsReadOnlyHostMenu();
    });

    it('Should display the Networking page in viewer mode', () => {
      navbar.clickOnNavItem('Networking');

      networkingPage.getClusterManagedNetworking().should('be.disabled');
      networkingPage.getUserManagedNetworking().should('be.disabled');
      networkingPage.getAdvancedNetwork().should('be.disabled');
      networkingPage.getClusterNetworkCidr().should('be.disabled');
      networkingPage.getClusterNetworkPrefix().should('be.disabled');
      networkingPage.getServiceCidr().should('be.disabled');
      networkingPage.getSshKey().should('be.disabled');
    });

    it('Should display the Review page in viewer mode', () => {
      navbar.clickOnNavItem('Review and create');

      reviewAndCreatePage.getInstallButton().should('be.disabled');
    });
  });
});
