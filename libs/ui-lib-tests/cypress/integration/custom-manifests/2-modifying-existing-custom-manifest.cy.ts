import { commonActions } from '../../views/common';
import { setLastWizardSignal } from '../../support/utils';
import { customManifestsPage } from '../../views/customManifestsPage';
const ACTIVE_NAV_ITEM_CLASS = 'pf-m-current';

describe(`Assisted Installer Custom manifests step`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: 'ONLY_DUMMY_CUSTOM_MANIFEST_ADDED',
      activeScenario: 'AI_CREATE_CUSTOM_MANIFESTS',
    });
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    setLastWizardSignal('ONLY_DUMMY_CUSTOM_MANIFEST_ADDED');
    commonActions.visitClusterDetailsPage();
  });

  describe('Initial step for Custom Manifests', () => {
    it('Should move to "Custom manifests" step if the current manifests are incomplete', () => {
      cy.wait('@list-manifests').then(() => {
        commonActions
            .getWizardStepNav('Custom manifests')
            .should('have.class', ACTIVE_NAV_ITEM_CLASS);

        commonActions.verifyIsAtStep('Custom manifests');
        commonActions.getNextButton().should('be.disabled');
      });
    });

    it('Should stay in "Review" step if the current manifests are complete', () => {
      setLastWizardSignal('CUSTOM_MANIFEST_ADDED');
      cy.wait('@list-manifests').then(() => {
        commonActions
            .getWizardStepNav('Custom manifests')
            .should('not.have.class', ACTIVE_NAV_ITEM_CLASS);

        commonActions.verifyIsAtStep('Review');
      });
    });
  });

  describe('Editing manifests', () => {
    it('Adding valid content to dummy manifest enables next button', () => {
      customManifestsPage.getStartFromScratch().click();
      customManifestsPage.fileUpload(0).attachFile(`custom-manifests/files/manifest1.yaml`);
      commonActions.getNextButton().should('be.enabled');
    });

    it('Cannot upload binary file into manifest content', () => {
      customManifestsPage.getStartFromScratch().click();
      customManifestsPage.fileUpload(0).attachFile(`custom-manifests/files/img.png`);
      customManifestsPage
          .getYamlContentError()
          .should('contain.text', 'File type is not supported. File type must be yaml, yml or json.');
      commonActions.getNextButton().should('be.disabled');
    });

    it('Incorrect file name is shown as an error', () => {
      customManifestsPage.getFileName(0).clear().type('test.txt');
      customManifestsPage
          .getFileNameError()
          .should('contain.text', 'Must have a yaml, yml or json extension and can not contain /.');
      customManifestsPage
          .getAlertTitle()
          .should(
              'contain.text',
              'Custom manifests configuration contains missing or invalid fields',
          );
      commonActions.getNextButton().should('be.disabled');
    });
  });
});
