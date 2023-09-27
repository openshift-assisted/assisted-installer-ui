import { commonActions } from '../../views/common';
import * as utils from '../../support/utils';
import { CustomManifestsForm } from '../../views/forms';

describe(`Assisted Installer Custom manifests step`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_CUSTOM_MANIFESTS',
    });
  };

  describe('Custom Manifests actions', () => {
    before(() => setTestStartSignal('ONLY_DUMMY_CUSTOM_MANIFEST_ADDED'));

    beforeEach(() => {
      setTestStartSignal('ONLY_DUMMY_CUSTOM_MANIFEST_ADDED');
      commonActions.visitClusterDetailsPage();
    });

    it('Can add new custom manifests', () => {
      // First make the incomplete dummy manifest valid
      CustomManifestsForm.initManifest(0);
      CustomManifestsForm.expandedManifest(0)
        .fileUpload()
        .attachFile(`custom-manifests/files/manifest1.yaml`);
      CustomManifestsForm.addManifest().should('be.enabled');
      CustomManifestsForm.addManifest().click();

      // Now we can add a new manifest
      CustomManifestsForm.initManifest(1);
      CustomManifestsForm.expandedManifest(1).fileName().type('manifest2.yaml');
      CustomManifestsForm.expandedManifest(1)
        .fileUpload()
        .attachFile(`custom-manifests/files/manifest1.yaml`);
      CustomManifestsForm.addManifest().should('be.enabled');

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
  });

  describe('Custom manifests actions #2', () => {
    before(() => setTestStartSignal('CUSTOM_MANIFEST_ADDED'));

    beforeEach(() => {
      setTestStartSignal('CUSTOM_MANIFEST_ADDED');
      commonActions.visitClusterDetailsPage();
      commonActions.startAtWizardStep('Custom manifests');
    });

    it('Can delete custom manifest', () => {
      utils.setLastWizardSignal('CUSTOM_MANIFEST_ADDED');
      commonActions.startAtWizardStep('Custom manifests');

      CustomManifestsForm.addManifest().should('be.enabled');
      CustomManifestsForm.addManifest().click();

      CustomManifestsForm.initManifest(1);
      CustomManifestsForm.expandedManifest(1).fileName().type('manifest2.yaml');
      CustomManifestsForm.expandedManifest(1)
        .fileUpload()
        .attachFile(`custom-manifests/files/manifest1.yaml`);
      CustomManifestsForm.removeManifest(1).click();
      CustomManifestsForm.getRemoveConfirmationButton().click();
      cy.wait('@delete-manifests').then(({ request }) => {
        expect(request.url).to.contain('folder=manifests&file_name=manifest2.yaml');
      });
    });

    it('Enforces unique file names for custom manifests', () => {
      CustomManifestsForm.addManifest().click();
      CustomManifestsForm.initManifest(1);
      CustomManifestsForm.expandedManifest(1).fileName().type('manifest2.yaml');
      CustomManifestsForm.expandedManifest(1)
        .fileUpload()
        .attachFile(`custom-manifests/files/manifest1.yaml`);

      CustomManifestsForm.addManifest().click();
      CustomManifestsForm.initManifest(2);
      CustomManifestsForm.expandedManifest(2).fileName().type('manifest2.yaml');

      CustomManifestsForm.expandedManifest(2)
        .fileNameError()
        .should('contain.text', 'Ensure unique file names to avoid conflicts and errors.');

      CustomManifestsForm.initManifest(0, true);
      CustomManifestsForm.collapsedManifest(0).name();
      CustomManifestsForm.initManifest(1, true);
      CustomManifestsForm.collapsedManifest(1).error();
    });
  });
});
