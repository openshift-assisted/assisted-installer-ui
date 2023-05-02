import { reviewAndCreatePage } from '../../views/reviewCreate';
import { commonActions } from '../../views/common';
import { transformBasedOnUIVersion } from '../../support/transformations';

describe(`Assisted Installer Multinode Review`, () => {
  before(() => {
    transformBasedOnUIVersion();
    cy.loadAiAPIIntercepts({
      activeSignal: 'READY_TO_INSTALL',
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    commonActions.visitClusterDetailsPage();
    commonActions.getHeader('h2').should('contain', 'Review and create');
  });

  describe('Cluster summary', () => {
    it('Should be ready to install', () => {
      reviewAndCreatePage.validateClusterDetails();
      reviewAndCreatePage.expandPreflightCheckSection();
      reviewAndCreatePage.checkAllClusterValidationsPassed();
      reviewAndCreatePage.checkAllHostsValidationsPassed();
      reviewAndCreatePage.waitForInstallButton();
    });
  });
});
