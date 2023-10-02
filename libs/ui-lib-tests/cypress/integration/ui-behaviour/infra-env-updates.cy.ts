import { bareMetalDiscoveryPage } from '../../views/forms/HostDiscovery/bareMetalDiscovery';
import { bareMetalDiscoveryIsoModal } from '../../views/forms/HostDiscovery/bareMetalDiscoveryIsoModal';
import { commonActions } from '../../views/pages/common';

describe('Assisted Installer UI behaviour - infra env updates', () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };

  before(() => setTestStartSignal('CLUSTER_CREATED'));

  beforeEach(() => {
    setTestStartSignal('CLUSTER_CREATED');
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
