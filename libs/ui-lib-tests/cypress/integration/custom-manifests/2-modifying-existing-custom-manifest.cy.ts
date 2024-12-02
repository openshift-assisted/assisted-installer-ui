import { commonActions } from '../../views/common';
import { CustomManifestsForm } from '../../views/forms';

const ACTIVE_NAV_ITEM_CLASS = 'pf-m-current';

describe(`Assisted Installer Custom manifests step`, () => {
  describe('Initial step for Custom Manifests', () => {
    const setTestStartSignal = (activeSignal: string) => {
      cy.setTestEnvironment({
        activeSignal,
        activeScenario: 'AI_CREATE_CUSTOM_MANIFESTS',
      });
    };

    before(() => setTestStartSignal('ONLY_DUMMY_CUSTOM_MANIFEST_ADDED'));

    beforeEach(() => {
      setTestStartSignal('ONLY_DUMMY_CUSTOM_MANIFEST_ADDED');
      commonActions.visitClusterDetailsPage();
    });

    it('Should move to "Custom manifests" step if the current manifests are incomplete', () => {
      cy.wait('@list-manifests').then(() => {
        commonActions
          .getWizardStepNav('Custom manifests')
          .should('have.class', ACTIVE_NAV_ITEM_CLASS);

        commonActions.verifyIsAtStep('Custom manifests');
        commonActions.verifyNextIsDisabled();
      });
    });
  });

  describe('Initial step for Custom Manifests', () => {
    const setTestStartSignal = (activeSignal: string) => {
      cy.setTestEnvironment({
        activeSignal,
        activeScenario: 'AI_CREATE_CUSTOM_MANIFESTS',
      });
    };

    before(() => setTestStartSignal('CUSTOM_MANIFEST_ADDED'));

    beforeEach(() => {
      setTestStartSignal('CUSTOM_MANIFEST_ADDED');
      commonActions.visitClusterDetailsPage();
    });

    it('Should stay in "Review" step if the current manifests are complete', () => {
      cy.wait('@ui-settings').then(() => {
        commonActions
          .getWizardStepNav('Custom manifests')
          .should('not.have.class', ACTIVE_NAV_ITEM_CLASS);

        commonActions.verifyIsAtStep('Review');
      });
    });
  });

  describe('Editing manifests', () => {
    const setTestStartSignal = (activeSignal: string) => {
      cy.setTestEnvironment({
        activeSignal,
        activeScenario: 'AI_CREATE_CUSTOM_MANIFESTS',
      });
    };

    before(() => setTestStartSignal('ONLY_DUMMY_CUSTOM_MANIFEST_ADDED'));

    beforeEach(() => {
      setTestStartSignal('ONLY_DUMMY_CUSTOM_MANIFEST_ADDED');
      commonActions.visitClusterDetailsPage();
    });

    it('Adding valid content to dummy manifest enables next button', () => {
      CustomManifestsForm.initManifest(0);
      CustomManifestsForm.expandedManifest(0)
        .fileUpload()
        .attachFile(`custom-manifests/files/manifest1.yaml`);
      commonActions.verifyNextIsEnabled();
    });

    it('Cannot upload binary file into manifest content', () => {
      CustomManifestsForm.initManifest(0);
      CustomManifestsForm.expandedManifest(0).fileName().clear().type('fdd');
      CustomManifestsForm.expandedManifest(0)
        .fileUpload()
        .attachFile(`custom-manifests/files/img.png`);
      CustomManifestsForm.expandedManifest(0)
        .fileUploadError()
        .should(
          'contain.text',
          'File type is not supported. File type must be yaml, yml ,json , yaml.patch. or yml.patch.',
        );
      commonActions.verifyNextIsDisabled();
    });

    it('Incorrect file name is shown as an error', () => {
      CustomManifestsForm.initManifest(0);
      CustomManifestsForm.expandedManifest(0).fileName().clear().type('test.txt');
      CustomManifestsForm.expandedManifest(0)
        .fileNameError()
        .should(
          'contain.text',
          'Must have a yaml, yml, json, yaml.patch or yml.patch extension and can not contain /.',
        );

      CustomManifestsForm.validationAlert().should(
        'contain.text',
        'Custom manifests configuration contains missing or invalid fields',
      );
      commonActions.verifyNextIsDisabled();
    });

    it('Adding multi-yaml file to dummy manifest enables next button', () => {
      CustomManifestsForm.initManifest(0);
      CustomManifestsForm.expandedManifest(0)
        .fileUpload()
        .attachFile(`custom-manifests/files/manifest_multiple.yaml`);
      commonActions.verifyNextIsEnabled();
    });

    it('Testing that incorrect patch name for manifests is not allowed', () => {
      CustomManifestsForm.initManifest(0);
      CustomManifestsForm.expandedManifest(0).fileName().clear().type('test.yaml.patch.aaa');
      CustomManifestsForm.expandedManifest(0)
        .fileNameError()
        .should(
          'contain.text',
          'Must have a yaml, yml, json, yaml.patch or yml.patch extension and can not contain /.',
        );

      CustomManifestsForm.validationAlert().should(
        'contain.text',
        'Custom manifests configuration contains missing or invalid fields',
      );
      commonActions.verifyNextIsDisabled();
    });
  });
});
