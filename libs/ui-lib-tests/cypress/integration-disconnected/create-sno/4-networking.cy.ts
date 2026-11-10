import * as fixtures from '../../fixtures';
import { commonActions } from '../../views/common';
import { networkingPage } from '../../views/networkingPage';

describe(`Assisted Installer SNO Networking`, () => {
  const setTestStartSignal = (activeSignal: string) => {
    cy.setTestEnvironment({
      activeSignal,
      activeScenario: 'AI_OVE_CREATE_SINGLENODE',
      singleCluster: true,
    });
  };

  beforeEach(() => {
    setTestStartSignal('READY_TO_INSTALL');
    cy.visit(`/${fixtures.fakeClusterId}`);
    commonActions.startAtWizardStep('Networking');
  });

  it('Should see the Ready Host inventory status', () => {
    networkingPage.waitForNetworkStatus('Ready');
    networkingPage.waitForNetworkStatusToNotContain('Some validations failed');
  });

  it('Should have enforced Network Management', () => {
    networkingPage.getUserManagedNetworking().should('not.be.enabled').and('be.checked');
    networkingPage.getClusterManagedNetworking().should('not.be.enabled').should('not.be.checked');
    networkingPage.getAdvancedNetwork().should('not.be.checked');
  });

  it('Should reuse SSH key from infra env', () => {
    networkingPage.getShareSshKeyInput().should('be.checked');
    networkingPage.getSshKey().should('not.exist');
  });

  it('Allows to proceed to Custom manifests', () => {
    commonActions.verifyNextIsEnabled();
    commonActions.getNextButton().click();
    commonActions.verifyIsAtStep('Custom manifests');
  });
});
