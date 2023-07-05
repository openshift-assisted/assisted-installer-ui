import { commonActions } from '../../views/common';
import { reviewAndCreatePage } from '../../views/reviewCreate';

describe(`Assisted Installer SNO Review`, () => {
  const refreshTestSetup = () => {
    cy.setTestingEnvironment({
      activeSignal: 'READY_TO_INSTALL',
      activeScenario: 'AI_CREATE_SNO',
    });
  };

  before(refreshTestSetup);

  beforeEach(() => {
    refreshTestSetup();
    commonActions.visitClusterDetailsPage();
    commonActions.verifyIsAtStep('Review and create');
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
