import { commonActions } from '../../views/common';
import { reviewAndCreatePage } from '../../views/reviewCreate';
import { transformBasedOnUIVersion } from '../../support/transformations';

describe(`Assisted Installer SNO Review`, () => {
  before(() => {
    transformBasedOnUIVersion();
    cy.loadAiAPIIntercepts({
      activeSignal: 'READY_TO_INSTALL',
      activeScenario: 'AI_CREATE_SNO',
    });
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    commonActions.visitClusterDetailsPage();
    commonActions.getHeader('h2').should('contain', 'Review and create');
  });

  describe('Cluster summary', () => {
    it('Should be ready to install', () => {
      reviewAndCreatePage.checkAllValidationsPassed(reviewAndCreatePage.getClusterValidations());
      reviewAndCreatePage.checkAllValidationsPassed(reviewAndCreatePage.getHostValidations());
      reviewAndCreatePage.validateClusterDetails();
      reviewAndCreatePage.waitForInstallButton();
    });
  });
});
