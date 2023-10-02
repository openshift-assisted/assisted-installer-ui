import { UMNetworkingRequest } from '../../../fixtures/create-mn/requests';
import { commonActions } from '../../../views/pages/common';
import { networkingPage } from '../../../views/forms/Networking/networkingPage';

describe('Create cluster with UMN', () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
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

  it('Should be able to switch to UMN', () => {
    networkingPage.getClusterManagedNetworking().should('be.checked');
    networkingPage.getUserManagedNetworking().click();

    cy.wait('@update-cluster').then((req) => {
      expect(req.request.body).to.deep.eq(UMNetworkingRequest);
    });
  });
});
