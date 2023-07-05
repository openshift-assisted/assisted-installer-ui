import { bareMetalDiscoveryPage } from '../../views/bareMetalDiscovery';
import { bareMetalDiscoveryIsoModal } from '../../views/bareMetalDiscoveryIsoModal';
import { commonActions } from '../../views/common';

describe('Assisted Installer UI behaviour - infra env updates', () => {
  const startTestWithSignal = (activeSignal: string) => {
    cy.setTestingEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };

  before(() => startTestWithSignal('CLUSTER_CREATED'));

  beforeEach(() => {
    startTestWithSignal('CLUSTER_CREATED');
    commonActions.visitClusterDetailsPage();
  });

  it('Should use the selected image type', () => {
    bareMetalDiscoveryPage.openAddHostsModal();

    // Default should be full-iso
    bareMetalDiscoveryIsoModal.getGenerateDiscoveryIso().click();
    cy.wait('@update-infra-env').then(({ request }) => {
      expect(request.body.image_type).to.equal('full-iso');
    });

    // Change to minimal-iso
    bareMetalDiscoveryIsoModal.getEditISO().click();
    bareMetalDiscoveryIsoModal.selectImageType('Minimal image file');
    bareMetalDiscoveryIsoModal.getGenerateDiscoveryIso().click();

    cy.wait('@update-infra-env').then(({ request }) => {
      expect(request.body.image_type).to.equal('minimal-iso');
    });
  });
});
