import { reviewAndCreatePage } from '../../views/reviewCreate';
import { commonActions } from '../../views/common';

describe(`Assisted Installer Dualstack Review`, () => {
  const startTestWithSignal = (activeSignal: string) => {
    cy.setTestingEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_DUALSTACK',
    });
  };

  before(() => startTestWithSignal('READY_TO_INSTALL'));

  beforeEach(() => {
    startTestWithSignal('READY_TO_INSTALL');
    commonActions.visitClusterDetailsPage();
    commonActions.verifyIsAtStep('Review and create');
  });

  it('Should be ready to install', () => {
    reviewAndCreatePage.validateClusterDetails({ stackType: 'Dual-stack' });
    reviewAndCreatePage.expandPreflightCheckSection();
    reviewAndCreatePage.checkAllClusterValidationsPassed();
    reviewAndCreatePage.checkAllHostsValidationsPassed();
    reviewAndCreatePage.waitForInstallButton();
  });
});
