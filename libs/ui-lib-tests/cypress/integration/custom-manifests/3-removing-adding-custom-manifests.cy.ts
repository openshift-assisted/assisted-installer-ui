import { commonActions } from '../../views/common';

import { transformBasedOnUIVersion } from '../../support/transformations';
import { customManifestsPage } from '../../views/customManifestsPage';
const ACTIVE_NAV_ITEM_CLASS = 'pf-m-current';

describe(`Assisted Installer Custom manifests step`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: 'READY_TO_INSTALL',
      activeScenario: 'AI_CREATE_CUSTOM_MANIFESTS',
    });
    transformBasedOnUIVersion();
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    commonActions.visitClusterDetailsPage();
  });
  describe('List of Custom Manifests', () => {
    it.skip('Can add more custom manifests', () => {
      customManifestsPage.getStartFromScratch().click();
      customManifestsPage.fileUpload().attachFile(`custom-manifests/files/manifest1.yaml`);
      customManifestsPage.getLinkToAdd().should('be.enabled');
      customManifestsPage.getLinkToAdd().click();
      customManifestsPage.getManifest1Id().type('manifest2.yaml');
      customManifestsPage.lastFileUpload().attachFile(`custom-manifests/files/manifest2.yaml`);
      customManifestsPage.getLinkToAdd().should('be.enabled');
    });
    it('Can delete custom manifest', () => {
      customManifestsPage.getStartFromScratch().click();
      customManifestsPage.fileUpload().attachFile(`custom-manifests/files/manifest1.yaml`);
      customManifestsPage.getLinkToAdd().should('be.enabled');
      customManifestsPage.getLinkToAdd().click();
      customManifestsPage.getManifest1Id().type('manifest2.yaml');
      customManifestsPage.lastFileUpload().attachFile(`custom-manifests/files/manifest2.yaml`);
      customManifestsPage.getLinkToAdd().should('be.enabled');
      customManifestsPage.getRemoveManifestButton().click();
      customManifestsPage.getRemoveConfirmationButton().click();
    });
  });
});
