import { UMNetworkingRequest } from '../../../fixtures/create-mn/requests';
import { commonActions } from '../../../views/common';
import { networkingPage } from '../../../views/networkingPage';

describe('Create cluster with UMN', () => {
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

  it('Should be able to switch to UMN', () => {
    networkingPage.getClusterManagedNetworking().should('be.checked');
    networkingPage.getUserManagedNetworking().click();

    cy.wait('@update-cluster').then((req) => {
      expect(req.request.body).to.deep.eq(UMNetworkingRequest);
    });
  });
});
