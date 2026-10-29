import * as fixtures from '../../fixtures';
import { commonActions } from '../../views/common';

describe(`Assisted Installer Storage`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_OVE_CREATE_MULTINODE',
      singleCluster: true,
    });
  };

  beforeEach(() => {
    setTestStartSignal('HOST_RENAMED_3');
    cy.visit(`/${fixtures.fakeClusterId}`);
    commonActions.startAtWizardStep('Storage');
  });

  it('Can proceed to Networking', () => {
    commonActions.verifyNextIsEnabled();
    commonActions.getNextButton().click();
    commonActions.verifyIsAtStep('Networking');
  });
});
