import { transformBasedOnUIVersion } from '../../support/transformations';
import { bareMetalDiscoveryPage } from '../../views/bareMetalDiscovery';
import { bareMetalDiscoveryIsoModal } from '../../views/bareMetalDiscoveryIsoModal';
import { commonActions } from '../../views/common';

describe('Assisted Installer UI behaviour - infra env updates', () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: 'CLUSTER_CREATED',
      activeScenario: 'AI_CREATE_MULTINODE',
    });
    transformBasedOnUIVersion();
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    commonActions.visitClusterDetailsPage();
  });

  it('Should discriminate between full and minimal image', () => {
    bareMetalDiscoveryPage.openAddHostsModal();
    bareMetalDiscoveryIsoModal.getGenerateDiscoveryIso().click();
    bareMetalDiscoveryIsoModal.getEditISO().click();
    bareMetalDiscoveryIsoModal.selectImageType('Minimal image file');
    bareMetalDiscoveryIsoModal.getGenerateDiscoveryIso().click();
    cy.wait(['@update-infra-env', '@update-infra-env']).then((interceptions) => {
      // The infraEnv fixture has full-iso initially, so we change it to the minimal
      const isoRequests = interceptions.map((x) => x.request.body.image_type);
      expect(isoRequests.join(',')).to.equal(['full-iso', 'minimal-iso'].join(','));
    });
  });
});
