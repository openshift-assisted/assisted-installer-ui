import { utils } from '../../../support';
import { transformBasedOnUIVersion } from '../../../support/transformations';
import { clusterDetailsPage } from '../../../views/clusterDetails';
import { commonActions } from '../../../views/common';
import OperatorsForm from '../../../views/forms/OperatorsForm';

describe(`Create cluster with mce operator enabled`, () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: 'CLUSTER_CREATED',
      activeScenario: 'AI_CREATE_MULTINODE',
    });
    transformBasedOnUIVersion();
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);
    commonActions.visitClusterDetailsPage();
    commonActions.clickBackButton();
  });

  describe('When the feature is enabled:', () => {
    it('There is a popover and helper text next to the checkbox label', () => {
      OperatorsForm.mceOperatorControl.findPopoverButton().click();
      OperatorsForm.mceOperatorControl.findPopoverContent();
      OperatorsForm.mceOperatorControl.findHelperText();
    });
    it('The user can select the multicluster engine checkbox', () => {
      OperatorsForm.mceOperatorControl.findLabel().click();
      commonActions.waitForNext();
      commonActions.getNextButton().should('be.enabled');
    });
  });
});
