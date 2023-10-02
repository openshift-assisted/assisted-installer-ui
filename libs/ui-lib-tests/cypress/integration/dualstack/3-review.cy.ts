import { reviewAndCreatePage } from '../../views/forms/ReviewAndCreate/reviewCreate';
import { commonActions } from '../../views/pages/common';

describe(`Assisted Installer Dualstack Review`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_DUALSTACK',
    });
  };

  before(() => setTestStartSignal('READY_TO_INSTALL'));

  beforeEach(() => {
    setTestStartSignal('READY_TO_INSTALL');
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
