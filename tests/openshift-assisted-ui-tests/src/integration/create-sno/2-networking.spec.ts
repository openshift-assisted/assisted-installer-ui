import { commonActions } from '../../views/common';
import { networkingPage } from '../../views/networkingPage';
import * as utils from '../../support/utils';

describe(`Assisted Installer SNO Networking`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: 'HOST_RENAMED_1',
      activeScenario: 'AI_CREATE_SNO',
    });
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    commonActions.visitClusterDetailsPage();
    commonActions.startAtNetworkingStep();
  });

  describe('Validating the Network configuration', () => {
    it('Should see the Ready Host inventory status', () => {
      cy.wait('@cluster-details').then(() => {
        utils.setLastWizardSignal('READY_TO_INSTALL');
      });

      networkingPage.waitForNetworkStatus('Ready');
      networkingPage.waitForNetworkStatusToNotContain('Some validations failed');
    });

    it('Should have enforced Network Management', () => {
      networkingPage.getUserManagedNetworking().should('not.be.enabled').and('be.checked');
      networkingPage.getClusterManagedNetworking().should('not.be.enabled').should('not.be.checked');
      networkingPage.getAdvancedNetwork().should('not.be.checked');
    });

    it('Should have the correct default network type', () => {
      networkingPage.getAdvancedNetwork().click();
      networkingPage.getSdnNetworkingField().should('not.be.enabled').and('not.be.checked');
      networkingPage.getOvnNetworkingField().should('be.enabled').and('be.checked');
    });

    it('Should go to the final step', () => {
      commonActions.clickNextButton();
    });
  });
});
