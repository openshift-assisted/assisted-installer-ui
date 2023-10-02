import { commonActions } from '../../views/pages/common';
import { networkingPage } from '../../views/forms/Networking/networkingPage';
import {
  dualStackNetworkingRequest,
  ipv4NetworkingRequest,
} from '../../fixtures/dualstack/requests';

describe(`Assisted Installer Dualstack Networking`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_DUALSTACK',
    });
  };

  before(() => setTestStartSignal('NETWORKING_DUAL_STACK_DISCOVERED'));

  describe('Cluster configured with Single Stack', () => {
    beforeEach(() => {
      setTestStartSignal('NETWORKING_DUAL_STACK_SELECT_SINGLE_STACK');
      commonActions.visitClusterDetailsPage();
      commonActions.moveNextSteps(['Host discovery', 'Storage']);
    });

    it('Networking is displayed correctly', () => {
      networkingPage.getStackTypeSingleStack().should('be.enabled').and('be.checked');
      networkingPage.getClusterManagedNetworking().should('be.enabled').and('be.checked');
      networkingPage.getVipDhcp().should('be.enabled').and('not.be.checked');
      networkingPage.getAdvancedNetwork().should('be.enabled').and('not.be.checked');
    });

    it('Can switch to dual-stack', () => {
      networkingPage.getStackTypeDualStack().should('be.enabled').and('not.be.checked');
      networkingPage.getStackTypeDualStack().check();

      networkingPage.getStackTypeDualStack().should('be.enabled').and('be.checked');
      networkingPage.getClusterManagedNetworking().should('be.disabled').and('be.checked');
      networkingPage.getVipDhcp().should('be.disabled').and('not.be.checked');
      networkingPage.getOvnNetworkingField().should('not.be.enabled').and('be.checked');
      networkingPage.getSdnNetworkingField().should('not.be.enabled').and('not.be.checked');
      networkingPage.waitForNetworkStatusToNotContain('Some validations failed');

      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body, 'Networking request body').to.deep.equal(dualStackNetworkingRequest);
      });
    });
  });

  describe('Cluster configured with Dual Stack', () => {
    beforeEach(() => {
      setTestStartSignal('NETWORKING_DUAL_STACK_SELECT_DUAL_STACK');
      commonActions.visitClusterDetailsPage();
      commonActions.moveNextSteps(['Host discovery', 'Storage']);
    });

    it('Can switch to single-stack', () => {
      networkingPage.getStackTypeDualStack().should('be.enabled').and('be.checked');
      networkingPage.getStackTypeSingleStack().should('be.enabled').check();
      networkingPage.confirmStackTypeChange();

      networkingPage.getClusterManagedNetworking().should('be.enabled').and('be.checked');
      networkingPage.getStackTypeSingleStack().should('be.enabled').and('be.checked');
      networkingPage.getVipDhcp().should('be.disabled').and('not.be.checked');
      networkingPage.getOvnNetworkingField().should('be.enabled').and('be.checked');
      networkingPage.getSdnNetworkingField().should('be.enabled').and('not.be.checked');

      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body, 'Networking request body').to.deep.equal(ipv4NetworkingRequest);
      });
    });
  });
});
