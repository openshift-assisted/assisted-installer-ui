import { commonActions } from '../../../views/common';
import OperatorsForm from '../../../views/forms/Operators/OperatorsForm';
import { operatorsPage } from '../../../views/operatorsPage';

describe(`Create cluster with MTV operator enabled`, () => {
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
    operatorsPage.singleOperatorsToggle().click();
  });

  describe('When the feature is enabled:', () => {
    it('There is a popover and helper text next to the checkbox label', () => {
      OperatorsForm.mtvOperatorControl.findHelperText();
    });
    it('The user can select the MTV checkbox', () => {
      OperatorsForm.mtvOperatorControl.findLabel().click({ force: true });
      commonActions.toNextStepAfter('Operators');

      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body.olm_operators).to.deep.equal([
          { name: 'cnv' },
          { name: 'lso' },
          { name: 'mtv' },
        ]);
      });
    });
  });
});
