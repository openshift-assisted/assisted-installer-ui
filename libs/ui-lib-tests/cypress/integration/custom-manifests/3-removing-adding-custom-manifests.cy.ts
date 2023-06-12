import { commonActions } from '../../views/common';

import { transformBasedOnUIVersion } from '../../support/transformations';
import { customManifestsPage } from '../../views/customManifestsPage';
import common = require('mocha/lib/interfaces/common');

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
    it('Can add more custom manifests', () => {
      customManifestsPage.getStartFromScratch().click();
      customManifestsPage.fileUpload().attachFile(`custom-manifests/files/manifest1.yaml`);
      cy.loadAiAPIIntercepts(null, true);
      customManifestsPage.getLinkToAdd().should('be.enabled');
      customManifestsPage.getLinkToAdd().click();
      customManifestsPage.getManifest1Id().type('manifest2.yaml');
      customManifestsPage.lastFileUpload().attachFile(`custom-manifests/files/manifest2.yaml`);
      cy.loadAiAPIIntercepts(null, true);
      customManifestsPage.getLinkToAdd().should('be.enabled');
    });
    it('Can delete custom manifest', () => {
      cy.loadAiAPIIntercepts(null, true);
      commonActions.startAtCustomManifestsStep();
      customManifestsPage.getLinkToAdd().should('be.enabled');
      customManifestsPage.getLinkToAdd().click();
      customManifestsPage.getManifest1Id().type('manifest2.yaml');
      customManifestsPage.lastFileUpload().attachFile(`custom-manifests/files/manifest2.yaml`);
      cy.loadAiAPIIntercepts(null, true);
      customManifestsPage.getRemoveManifestButton().click();
      customManifestsPage.getRemoveConfirmationButton().click();
    });
  });
});
