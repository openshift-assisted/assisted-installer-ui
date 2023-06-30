import { commonActions } from '../../views/common';
import { reviewAndCreatePage } from '../../views/reviewCreate';
const ACTIVE_NAV_ITEM_CLASS = 'pf-m-current';

describe(`Assisted Installer Review and create step with custom manifests`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: 'READY_TO_INSTALL',
      activeScenario: 'AI_CREATE_CUSTOM_MANIFESTS',
    });
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null, true);
    commonActions.visitClusterDetailsPage();
  });

  describe('View existing Custom Manifests', () => {
    it('View existing manifests in Review and Create page', () => {
      commonActions
        .getWizardStepNav('Review and create')
        .should('have.class', ACTIVE_NAV_ITEM_CLASS);
      reviewAndCreatePage.getCustomManifestsSection().click();
      reviewAndCreatePage
        .getCustomManifestsDetail()
        .should('contain.text', 'manifests/manifest1.yaml');
    });
  });
});
