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

  describe('Modifyng existing Custom Manifests', () => {
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
      customManifestsPage.fileUpload().attachFile(`custom-manifests/files/manifest1.yaml`);
      cy.loadAiAPIIntercepts(null, true);
      commonActions.getNextButton().should('be.enabled');
    });
    it('Cannot upload binary file into manifest content', () => {
      customManifestsPage.getStartFromScratch().click();
      customManifestsPage.fileUpload().attachFile(`custom-manifests/files/img.png`);
      customManifestsPage
        .getYamlContentError()
        .contains('File type is not supported. File type must be yaml, yml or json.');
      commonActions.getNextButton().should('be.disabled');
    });
    it('Incorrect file name', () => {
      customManifestsPage.getFileName(0).clear().type('test.txt');
      customManifestsPage
        .getFileNameError()
        .contains('Must have a yaml, yml or json extension and can not contain /.');
      customManifestsPage
        .getAlertTitle()
        .contains('Custom manifests configuration contains missing or invalid fields');
      commonActions.getNextButton().should('be.disabled');
    });
  });
});
