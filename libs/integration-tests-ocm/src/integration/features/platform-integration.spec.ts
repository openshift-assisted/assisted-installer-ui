import { commonActions } from '../../views/common';
import { bareMetalDiscoveryPage } from '../../views/bareMetalDiscovery';

const SELECT_INTEGRATED_PLATFORM = 'vsphere';
const REMOVE_INTEGRATED_PLATFORM = 'baremetal';

const togglePlatformIntegrationSwitch = (platformToIntegrate: string) => {
  bareMetalDiscoveryPage.platformIntegration.getToggleSwitch().click({ force: true });
  cy.wait('@update-cluster').then(({ request }) => {
    expect(request.body).to.deep.equal({ platform: { type: platformToIntegrate } });
    Cypress.env('AI_INTEGRATED_PLATFORM', platformToIntegrate);
  });
}

describe('Assisted Installer - Platform integration feature', () => {
  describe('Switch behaviour', () => {
    before(() => {
      cy.loadAiAPIIntercepts({
        activeSignal: 'CLUSTER_CREATED',
        activeScenario: 'AI_CREATE_MULTINODE',
      });
    });

    beforeEach(() => {
      cy.loadAiAPIIntercepts(null);
      commonActions.visitClusterDetailsPage();
    });

    it('Should enable the switch after supported-platform changes', () => {
      // 1. Initial state does not support platform integration
      bareMetalDiscoveryPage.platformIntegration.getToggleSwitch().should('be.disabled');
      bareMetalDiscoveryPage.platformIntegration.getFullPotentialHint().should('not.exist');

      // 2. Next polling of supported-platforms enables vsphere as a platform integration
      Cypress.env('AI_SUPPORTED_PLATFORMS', ['none', SELECT_INTEGRATED_PLATFORM]);
      bareMetalDiscoveryPage.platformIntegration.getFullPotentialHint().should('exist');
      bareMetalDiscoveryPage.platformIntegration.getToggleSwitch().should('be.enabled');

      // 3. Now we choose to integrate the platform
      togglePlatformIntegrationSwitch(SELECT_INTEGRATED_PLATFORM);
      bareMetalDiscoveryPage.platformIntegration.getFullPotentialHint().should('not.exist');

      // 4. Finally, we choose to remove the integration and should go back to state 2.
      togglePlatformIntegrationSwitch(REMOVE_INTEGRATED_PLATFORM);
      bareMetalDiscoveryPage.platformIntegration.getFullPotentialHint().should('exist');
    });
  });
});
