import { commonActions } from '../../views/pages/common';
import { networkingPage } from '../../views/forms/Networking/networkingPage';

describe(`Assisted Installer SNO Networking`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_SNO',
    });
  };

  before(() => {
    setTestStartSignal('READY_TO_INSTALL');
  });

  beforeEach(() => {
    setTestStartSignal('READY_TO_INSTALL');
    commonActions.visitClusterDetailsPage();
    commonActions.startAtWizardStep('Networking');
  });

  describe('Validating the Network configuration', () => {
    it('Should see the Ready Host inventory status', () => {
      networkingPage.waitForNetworkStatus('Ready');
      networkingPage.waitForNetworkStatusToNotContain('Some validations failed');
    });

    it('Should have enforced Network Management', () => {
      networkingPage.getUserManagedNetworking().should('not.be.enabled').and('be.checked');
      networkingPage
        .getClusterManagedNetworking()
        .should('not.be.enabled')
        .should('not.be.checked');
      networkingPage.getAdvancedNetwork().should('not.be.checked');
    });

    it('Should have the correct default network type', () => {
      networkingPage.getAdvancedNetwork().click();
      networkingPage.getSdnNetworkingField().should('not.be.enabled').and('not.be.checked');
      networkingPage.getOvnNetworkingField().should('not.be.enabled').and('be.checked');
    });
  });
});
