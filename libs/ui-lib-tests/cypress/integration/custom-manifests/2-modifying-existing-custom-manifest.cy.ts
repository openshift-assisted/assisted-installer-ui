import { commonActions } from '../../views/common';
import { customManifestsPage } from '../../views/customManifestsPage';
const ACTIVE_NAV_ITEM_CLASS = 'pf-m-current';

describe(`Assisted Installer Custom manifests step`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: 'READY_TO_INSTALL',
      activeScenario: 'AI_CREATE_CUSTOM_MANIFESTS',
    });
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    commonActions.visitClusterDetailsPage();
  });

  describe('Modifying existing Custom Manifests', () => {
    it('Can configure custom manifests step and next button is disabled', () => {
      cy.wait('@list-manifests').then(() => {
        commonActions
          .getWizardStepNav('Custom manifests')
          .should('have.class', ACTIVE_NAV_ITEM_CLASS);
        commonActions.getNextButton().should('be.disabled');
      });
    });

    it('Add valid manifest content', () => {
      customManifestsPage.getStartFromScratch().click();
      customManifestsPage.fileUpload(0).attachFile(`custom-manifests/files/manifest1.yaml`);
      cy.loadAiAPIIntercepts(null, true);
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
    it('Incorrect file name', () => {
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
