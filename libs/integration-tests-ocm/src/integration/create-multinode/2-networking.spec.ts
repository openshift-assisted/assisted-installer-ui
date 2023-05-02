import { commonActions } from '../../views/common';
import { networkingPage } from '../../views/networkingPage';
import * as utils from '../../support/utils';

describe(`Assisted Installer Multinode Networking`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: 'HOST_RENAMED_1',
      activeScenario: 'AI_CREATE_MULTINODE',
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
      networkingPage.getUserManagedNetworking().should('be.enabled').and('not.be.checked');
      networkingPage.getClusterManagedNetworking().should('be.enabled').and('be.checked');
      networkingPage.getAdvancedNetwork().should('not.be.checked');
      networkingPage.getStackTypeSingleStack().should('be.checked');
      networkingPage.getStackTypeInput().should('be.disabled');
    });

    it('Should have the correct default network type', () => {
      networkingPage.getAdvancedNetwork().click();
      networkingPage.getSdnNetworkingField().should('be.enabled').and('be.checked');
      networkingPage.getOvnNetworkingField().should('be.enabled').and('not.be.checked');
    });

    it('Should go to the final step', () => {
      commonActions.clickNextButton();
    });
  });
});
