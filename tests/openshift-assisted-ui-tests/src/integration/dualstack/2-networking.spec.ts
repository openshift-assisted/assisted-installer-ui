import { commonActions } from '../../views/common';
import { networkingPage } from '../../views/networkingPage';
import * as utils from '../../support/utils';
import { dualStackNetworkingRequest, ipv4NetworkingRequest } from '../../fixtures/dualstack/requests';

describe(`Assisted Installer Dualstack Networking`, () => {
  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    commonActions.visitClusterDetailsPage();
    commonActions.startAtNetworkingStep();
  });

  describe('Cluster configured with Single Stack', () => {
    before(() => {
      cy.loadAiAPIIntercepts({
        activeSignal: 'NETWORKING_DUAL_STACK_DISCOVERED',
        activeScenario: 'AI_CREATE_DUALSTACK',
      });
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

      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body, 'Networking request body').to.deep.equal(dualStackNetworkingRequest);
        utils.setLastWizardSignal('NETWORKING_DUAL_STACK_SELECT_DUAL_STACK');
      });

      networkingPage.getStackTypeDualStack().should('be.enabled').and('be.checked');
      networkingPage.getClusterManagedNetworking().should('be.disabled').and('be.checked');
      networkingPage.getVipDhcp().should('be.disabled').and('not.be.checked');
      networkingPage.getOvnNetworkingField().should('be.enabled').and('be.checked');
      networkingPage.getSdnNetworkingField().should('be.disabled');
      networkingPage.waitForNetworkStatusToNotContain('Some validations failed');
    });
  });

  describe('Cluster configured with Dual Stack', () => {
    before(() => {
      cy.loadAiAPIIntercepts({
        activeSignal: 'NETWORKING_DUAL_STACK_SELECT_DUAL_STACK',
        activeScenario: 'AI_CREATE_DUALSTACK',
      });
    });

    it('Can switch to single-stack', () => {
      networkingPage.getStackTypeDualStack().should('be.enabled').and('be.checked');
      networkingPage.getStackTypeSingleStack().should('be.enabled').check();
      networkingPage.confirmStackTypeChange();

      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body, 'Networking request body').to.deep.equal(ipv4NetworkingRequest);
        utils.setLastWizardSignal('NETWORKING_DUAL_STACK_SELECT_SINGLE_STACK');
      });

      networkingPage.getClusterManagedNetworking().should('be.enabled').and('be.checked');
      networkingPage.getStackTypeSingleStack().should('be.enabled').and('be.checked');
      networkingPage.getVipDhcp().should('be.disabled').and('not.be.checked');
      networkingPage.getOvnNetworkingField().should('be.enabled').and('be.checked');
      networkingPage.getSdnNetworkingField().should('be.enabled').and('not.be.checked');
    });
  });
});
