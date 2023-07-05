import { reviewAndCreatePage } from '../../views/reviewCreate';
import { commonActions } from '../../views/common';

describe(`Assisted Installer Dualstack Review`, () => {
  const refreshTestSetup = () => {
    cy.setTestingEnvironment({
      activeSignal: 'READY_TO_INSTALL',
      activeScenario: 'AI_CREATE_DUALSTACK',
    });
  };

  before(refreshTestSetup);

  beforeEach(() => {
    refreshTestSetup();
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
