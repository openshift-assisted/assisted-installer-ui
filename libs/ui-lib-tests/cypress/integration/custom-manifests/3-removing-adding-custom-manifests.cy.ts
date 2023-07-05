import { commonActions } from '../../views/common';
import { customManifestsPage } from '../../views/customManifestsPage';
import * as utils from '../../support/utils';

describe(`Assisted Installer Custom manifests step`, () => {
  const refreshTestSetup = () => {
    cy.setTestingEnvironment({
      activeSignal: 'ONLY_DUMMY_CUSTOM_MANIFEST',
      activeScenario: 'AI_CREATE_CUSTOM_MANIFESTS',
    });
  };

  before(refreshTestSetup);

  beforeEach(() => {
    refreshTestSetup();
    commonActions.visitClusterDetailsPage();
  });

  describe('Custom Manifests actions', () => {
    it('Can add new custom manifests', () => {
      // First make the incomplete dummy manifest valid
      customManifestsPage.getStartFromScratch().click();
      customManifestsPage.fileUpload(0).attachFile(`custom-manifests/files/manifest1.yaml`);
      customManifestsPage.getLinkToAdd().should('be.enabled');
      customManifestsPage.getLinkToAdd().click();

      // Now we can add a new manifest
      customManifestsPage.getFileName(1).type('manifest2.yaml');
      customManifestsPage.fileUpload(1).attachFile(`custom-manifests/files/manifest1.yaml`);
      customManifestsPage.getLinkToAdd().should('be.enabled');

      cy.wait('@create-manifest').then(({ request }) => {
        // Verify that the new manifest content is submitted correctly
        expect(request.body).to.include({
          folder: 'manifests',
          file_name: 'manifest2.yaml',
          content:
            'YXBpVmVyc2lvbjogbWFjaGluZWNvbmZpZ3VyYXRpb24ub3BlbnNoaWZ0LmlvL3YxCmtpbmQ6IE1hY2hpbmVDb25maWcKbWV0YWRhdGE6CiAgbGFiZWxzOgogICAgbWFjaGluZWNvbmZpZ3VyYXRpb24ub3BlbnNoaWZ0LmlvL3JvbGU6IG1hc3RlcgogIG5hbWU6IDk5LW9wZW5zaGlmdC1tYWNoaW5lY29uZmlnLW1hc3Rlci1rYXJncwpzcGVjOgogIGtlcm5lbEFyZ3VtZW50czoKICAgIC0gbG9nbGV2ZWw9Nwo=',
        });
      });
    });

    it('Can delete custom manifest', () => {
      utils.setLastWizardSignal('CUSTOM_MANIFEST_ADDED');
      commonActions.startAtWizardStep('Custom manifests');

      customManifestsPage.getLinkToAdd().should('be.enabled');
      customManifestsPage.getLinkToAdd().click();
      customManifestsPage.getFileName(1).type('manifest2.yaml');
      customManifestsPage.fileUpload(1).attachFile(`custom-manifests/files/manifest1.yaml`);
      customManifestsPage.getRemoveManifestButton(1).click();
      customManifestsPage.getRemoveConfirmationButton().click();
      cy.wait('@delete-manifests').then(({ request }) => {
        expect(request.url).to.contain('folder=manifests&file_name=manifest2.yaml');
      });
    });
  });
});
