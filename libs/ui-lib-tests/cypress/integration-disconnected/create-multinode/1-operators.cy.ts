import * as fixtures from '../../fixtures';
import { commonActions } from '../../views/common';
import { operatorsPage } from '../../views/operatorsPage';
import OperatorsForm from '../../views/forms/Operators/OperatorsForm';

describe(`Assisted Installer OVE Multinode Operators`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal: activeSignal,
      activeScenario: 'AI_OVE_CREATE_MULTINODE',
      singleCluster: true,
    });
  };

  before(() => setTestStartSignal('CLUSTER_CREATED'));

  beforeEach(() => {
    setTestStartSignal('CLUSTER_CREATED');
    cy.visit(`/${fixtures.fakeClusterId}`);
  });

  describe('Operators page', () => {
    it('Selects a bundle and a standalone operator, enforces bundle-included operators, keeps Next enabled', () => {
      commonActions.startAtWizardStep('Operators');
      cy.wait('@bundles');
      cy.wait('@supported-operators');

      operatorsPage.singleOperatorsToggle().click();

      // Baseline: nothing selected, everything freely selectable, Next enabled.
      commonActions.verifyNextIsEnabled();
      operatorsPage.assertVirtualizationBundleSelected(false);
      OperatorsForm.assertOperatorCheckbox('cnv', { checked: false, disabled: false });
      OperatorsForm.assertOperatorCheckbox('nmstate', { checked: false, disabled: false });
      OperatorsForm.assertOperatorCheckbox('mtv', { checked: false, disabled: false });
      OperatorsForm.assertOperatorCheckbox('lvm', { checked: false, disabled: false });

      // Select the Virtualization bundle
      operatorsPage.selectVirtualizationBundle();
      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body.operator_bundles).to.deep.equal([
          { id: 'virtualization', optional_operators: [] },
        ]);
      });

      // Bundle-included operators cannot be selected standalone (checked + disabled).
      operatorsPage.assertVirtualizationBundleSelected(true);
      OperatorsForm.assertOperatorCheckbox('cnv', { checked: true, disabled: true });
      OperatorsForm.assertOperatorCheckbox('nmstate', { checked: true, disabled: true });
      OperatorsForm.assertOperatorCheckbox('mtv', { checked: true, disabled: true });
      // LVMS is not part of the bundle, so it stays freely selectable.
      OperatorsForm.assertOperatorCheckbox('lvm', { checked: false, disabled: false });
      commonActions.verifyNextIsEnabled();

      // Select the LVMS standalone operator
      OperatorsForm.getOperatorCheckbox('lvm').click();
      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body.olm_operators).to.deep.equal([{ name: 'lvm' }]);
      });
      commonActions.verifyNextIsEnabled();

      // Deselect the Virtualization bundle
      operatorsPage.deselectVirtualizationBundle();
      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body.operator_bundles).to.deep.equal([]);
      });
      operatorsPage.assertVirtualizationBundleSelected(false);
      OperatorsForm.assertOperatorCheckbox('cnv', { checked: false, disabled: false });
      OperatorsForm.assertOperatorCheckbox('nmstate', { checked: false, disabled: false });
      OperatorsForm.assertOperatorCheckbox('mtv', { checked: false, disabled: false });
      commonActions.verifyNextIsEnabled();

      // Deselect the standalone operator
      OperatorsForm.getOperatorCheckbox('lvm').click();
      cy.wait('@update-cluster').then(({ request }) => {
        expect(request.body.olm_operators).to.deep.equal([]);
      });
      commonActions.verifyNextIsEnabled();
    });

    it('Moves to Host discovery when clicking Next', () => {
      commonActions.startAtWizardStep('Operators');
      commonActions.verifyNextIsEnabled();
      commonActions.getNextButton().click();
      commonActions.verifyIsAtStep('Host discovery');
    });
  });
});
