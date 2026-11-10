import * as fixtures from '../../fixtures';
import { commonActions } from '../../views/common';
import { operatorsPage } from '../../views/operatorsPage';

describe(`Assisted Installer OVE SNO Operators`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal: activeSignal,
      activeScenario: 'AI_OVE_CREATE_SINGLENODE',
      singleCluster: true,
    });
  };

  before(() => setTestStartSignal('CLUSTER_CREATED'));

  beforeEach(() => {
    setTestStartSignal('CLUSTER_CREATED');
    cy.visit(`/${fixtures.fakeClusterId}`);
    commonActions.startAtWizardStep('Operators');
  });

  describe('Operators page', () => {
    it('Has Virtualization bundle disabled', () => {
      operatorsPage.getVirtualizationBundleCheckbox().should('not.be.enabled');
    });
  });
});
