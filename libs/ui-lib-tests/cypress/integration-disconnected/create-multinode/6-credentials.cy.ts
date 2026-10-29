import * as fixtures from '../../fixtures';
import { commonActions } from '../../views/common';
import { credentialsPage } from '../../views/credentialsPage';

describe(`Assisted Installer Multinode Download credentials`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_OVE_CREATE_MULTINODE',
      singleCluster: true,
    });
  };

  beforeEach(() => {
    setTestStartSignal('READY_TO_INSTALL');
    cy.visit(`/${fixtures.fakeClusterId}`);

    commonActions.startAtWizardStep('Download credentials');
  });

  it('Labels the primary button "Download credentials"', () => {
    commonActions.getNextButton().should('contain.text', 'Download credentials');
  });

  it('Keeps the download button disabled until consent is given', () => {
    credentialsPage.getConsentCheckbox().should('not.be.checked');
    commonActions.verifyNextIsDisabled();

    credentialsPage.checkConsent();
    credentialsPage.getConsentCheckbox().should('be.checked');
    commonActions.verifyNextIsEnabled();
  });

  it('Downloads credentials and advances to Review', () => {
    credentialsPage.checkConsent();
    commonActions.verifyNextIsEnabled();
    commonActions.getNextButton().click();

    cy.wait(['@download-kubeconfig', '@download-kubeadmin-password']);
    commonActions.verifyIsAtStep('Review and create');
  });
});
