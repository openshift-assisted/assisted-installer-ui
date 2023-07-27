import { commonActions } from '../../../views/common';
import OperatorsForm from '../../../views/forms/Operators/OperatorsForm';

describe(`Create cluster with mce operator enabled`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };

  before(() => setTestStartSignal('CLUSTER_CREATED'));

  beforeEach(() => {
    setTestStartSignal('CLUSTER_CREATED');
    commonActions.visitClusterDetailsPage();
    commonActions.startAtWizardStep('Operators');
  });

  describe('When the feature is enabled:', () => {
    it('There is a popover and helper text next to the checkbox label', () => {
      OperatorsForm.mceOperatorControl.findPopoverButton().click();
      OperatorsForm.mceOperatorControl.findPopoverContent();
      OperatorsForm.mceOperatorControl.findHelperText();
    });
    it('The user can select the multicluster engine checkbox', () => {
      OperatorsForm.mceOperatorControl.findLabel().click();
      commonActions.toNextStepAfter('Operators');

      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body.olm_operators).to.deep.equal([{ name: 'mce' }]);
      });
    });
  });
});
