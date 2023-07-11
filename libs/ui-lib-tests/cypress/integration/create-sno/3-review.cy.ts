import { commonActions } from '../../views/common';
import { reviewAndCreatePage } from '../../views/reviewCreate';

describe(`Assisted Installer SNO Review`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_SNO',
    });
  };

  before(() => setTestStartSignal('READY_TO_INSTALL'));

  beforeEach(() => {
    setTestStartSignal('READY_TO_INSTALL');
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
