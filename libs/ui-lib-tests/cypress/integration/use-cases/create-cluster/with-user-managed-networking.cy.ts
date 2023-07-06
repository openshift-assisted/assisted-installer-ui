import { UMNetworkingRequest } from '../../../fixtures/create-mn/requests';
import { commonActions } from '../../../views/common';
import { networkingPage } from '../../../views/networkingPage';

describe('Create cluster with UMN', () => {
  const startTestWithSignal = (activeSignal: string) => {
    cy.setTestingEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };

  before(() => {
    startTestWithSignal('READY_TO_INSTALL');
  });

  beforeEach(() => {
    startTestWithSignal('READY_TO_INSTALL');
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
