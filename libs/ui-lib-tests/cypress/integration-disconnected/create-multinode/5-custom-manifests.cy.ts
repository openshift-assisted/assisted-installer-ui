import * as fixtures from '../../fixtures';
import { commonActions } from '../../views/common';
import { CustomManifestsForm } from '../../views/forms';

describe(`Assisted Installer Multinode Custom manifests`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_OVE_CREATE_MULTINODE',
      singleCluster: true,
    });
  };

  beforeEach(() => {
    setTestStartSignal('ONLY_DUMMY_CUSTOM_MANIFEST_ADDED');
    cy.visit(`/${fixtures.fakeClusterId}`);

    commonActions.startAtWizardStep('Custom manifests');
  });

  it("Doesn't show system manifests", () => {
    CustomManifestsForm.enableCustomManifests();
    commonActions.verifyNextIsDisabled();

    CustomManifestsForm.disableCustomManifests();
    commonActions.verifyNextIsEnabled();
  });

  it('Navigates to Credentials step', () => {
    commonActions.getNextButton().click();
    commonActions.verifyIsAtStep('Download credentials');
  });
});
