import { commonActions } from '../../views/common';
import { networkingPage } from '../../views/networkingPage';
import { NetworkingRequest } from '../../fixtures/create-mn/requests';

describe(`Assisted Installer Multinode Networking`, () => {
  describe('Before entering Network configuration', () => {
    before(() => {
      cy.loadAiAPIIntercepts({
        activeSignal: 'HOST_RENAMED_3',
        activeScenario: 'AI_CREATE_MULTINODE',
      });
    });

    beforeEach(() => {
      cy.loadAiAPIIntercepts(null);
      commonActions.visitClusterDetailsPage();
      commonActions.moveNextSteps(['Host discovery', 'Storage']); // to networking
    });

    it('Should submit updated network information', () => {
      networkingPage.getApiVipField().should('not.have.value');
      networkingPage.getIngressVipField().should('not.have.value');
      networkingPage.inputApiVipIngressVip('192.168.122.10', '192.168.122.110');
      cy.wait('@update-cluster').then((req) => {
        expect(req.request.body).to.deep.equal(NetworkingRequest);
      });
    });
  });

  describe('After entering Network configuration', () => {
    before(() => {
      cy.loadAiAPIIntercepts({
        activeSignal: 'READY_TO_INSTALL',
        activeScenario: 'AI_CREATE_MULTINODE',
      });
    });

    beforeEach(() => {
      cy.loadAiAPIIntercepts(null);
      commonActions.visitClusterDetailsPage();
      commonActions.startAtWizardStep('Networking');
    });

    it('Should have filled Vips', () => {
      networkingPage.getApiVipField().should('have.value', '192.168.122.10');
      networkingPage.getIngressVipField().should('have.value', '192.168.122.110');
    });

    it('Should see the Ready Host inventory status', () => {
      networkingPage.waitForNetworkStatus('Ready');
      networkingPage.waitForNetworkStatusToNotContain('Some validations failed');
    });

    it('Should have enforced Network Management', () => {
      networkingPage.getUserManagedNetworking().should('be.enabled').and('not.be.checked');
      networkingPage.getClusterManagedNetworking().should('be.enabled').and('be.checked');
      networkingPage.getAdvancedNetwork().should('not.be.checked');
      networkingPage.getStackTypeSingleStack().should('be.checked');
      networkingPage.getStackTypeInput().should('be.disabled');
    });

    it('Should have the correct default network type', () => {
      networkingPage.getAdvancedNetwork().click();
      networkingPage.getSdnNetworkingField().should('be.enabled').and('not.be.checked');
      networkingPage.getOvnNetworkingField().should('be.enabled').and('be.checked');
    });
  });
});
