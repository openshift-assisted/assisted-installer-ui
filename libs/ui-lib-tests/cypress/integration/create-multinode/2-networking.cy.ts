import { commonActions } from '../../views/common';
import { networkingPage } from '../../views/networkingPage';
import { getNetworkingRequest } from '../../fixtures/create-mn/requests';

describe(`Assisted Installer Multinode Networking`, () => {
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

  describe('Validating the Network configuration', () => {
    it('Should see the Ready Host inventory status', () => {
      networkingPage.waitForNetworkStatus('Ready');
      networkingPage.waitForNetworkStatusToNotContain('Some validations failed');
    });

    it('Should submit updated network information', () => {
      const newApiVip = '192.168.122.33';
      const newIngressVip = '192.168.122.44';

      networkingPage.inputApiVipIngressVip(newApiVip, newIngressVip);
      cy.wait('@update-cluster').then((req) => {
        expect(req.request.body).to.deep.equal(getNetworkingRequest(newApiVip, newIngressVip));
      });
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
