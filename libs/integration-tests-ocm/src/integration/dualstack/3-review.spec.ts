import { reviewAndCreatePage } from '../../views/reviewCreate';
import { commonActions } from '../../views/common';

describe(`Assisted Installer Dualstack Review`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: 'READY_TO_INSTALL',
      activeScenario: 'AI_CREATE_DUALSTACK',
    });
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    commonActions.visitClusterDetailsPage();
    commonActions.getHeader('h2').should('contain', 'Review and create');
  });

  it('Should be ready to install', () => {
    reviewAndCreatePage.validateClusterDetails({ stackType: 'Dual-stack' });
    reviewAndCreatePage.expandPreflightCheckSection();
    reviewAndCreatePage.checkAllClusterValidationsPassed();
    reviewAndCreatePage.checkAllHostsValidationsPassed();
    reviewAndCreatePage.waitForInstallButton();
  });
});
