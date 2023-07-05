import { commonActions } from '../../views/common';
import { reviewAndCreatePage } from '../../views/reviewCreate';

describe(`Assisted Installer SNO Review`, () => {
  const startTestWithSignal = (activeSignal: string) => {
    cy.setTestingEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_SNO',
    });
  };

  before(() => startTestWithSignal('READY_TO_INSTALL'));

  beforeEach(() => {
    startTestWithSignal('READY_TO_INSTALL');
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
