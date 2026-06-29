import { commonActions } from '../../../views/common';
import OperatorsForm from '../../../views/forms/Operators/OperatorsForm';
import { operatorsPage } from '../../../views/operatorsPage';

const mtvOperatorPreflightRequirements = {
  operators: [
    {
      operatorName: 'mtv',
      dependencies: ['cnv'],
    },
    {
      operatorName: 'cnv',
      dependencies: ['lso'],
    },
  ],
};

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
    cy.intercept(
      'GET',
      `/api/assisted-install/v2/clusters/${Cypress.env('clusterId')}/preflight-requirements`,
      mtvOperatorPreflightRequirements,
    ).as('cluster-req');
    commonActions.visitClusterDetailsPage();
    commonActions.startAtWizardStep('Operators');
    operatorsPage.singleOperatorsToggle().click();
    cy.wait('@cluster-req');
    cy.wait('@supported-operators');
  });

  describe('When the feature is enabled:', () => {
    it('There is a popover and helper text next to the checkbox label', () => {
      OperatorsForm.mtvOperatorControl.findHelperText();
    });
    it('Selecting MTV checks dependency operators and sends only MTV to the API', () => {
      OperatorsForm.assertOperatorCheckbox('cnv', { checked: false, disabled: false });
      OperatorsForm.assertOperatorCheckbox('lso', { checked: false, disabled: true });

      OperatorsForm.mtvOperatorControl.findLabel().click({ force: true });

      OperatorsForm.assertOperatorCheckbox('mtv', { checked: true, disabled: false });
      OperatorsForm.assertOperatorCheckbox('cnv', { checked: true, disabled: true });
      OperatorsForm.assertOperatorCheckbox('lso', { checked: true, disabled: true });

      commonActions.toNextStepAfter('Operators');

      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body.olm_operators).to.deep.equal([{ name: 'mtv' }]);
      });
    });
  });
});
