import * as fixtures from '../../fixtures';
import * as utils from '../../support/utils';
import { commonActions } from '../../views/common';
import { reviewAndCreatePage } from '../../views/reviewCreate';

describe(`Assisted Installer Multinode Review and Create`, () => {
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

    commonActions.startAtWizardStep('Review and create');
  });

  it('Cluster should be ready to install', () => {
    reviewAndCreatePage.validateClusterDetails({ version: '4.22.21', stackType: 'Single stack' });
    reviewAndCreatePage.expandPreflightCheckSection();
    reviewAndCreatePage.checkAllClusterValidationsPassed();
    reviewAndCreatePage.checkAllHostsValidationsPassed();
    reviewAndCreatePage.waitForInstallButton();

    reviewAndCreatePage.getCustomManifestsSection().should('not.exist');
  });

  it('Should move to the installation progress page after clicking install', () => {
    reviewAndCreatePage.waitForInstallButton();
    reviewAndCreatePage.getInstallButton().click();

    cy.wait('@install-cluster');
    cy.contains('h2', 'Installation progress').should('be.visible');
    cy.get('#cluster-progress-status-value').should('contain.text', 'Preparing for installation');

    cy.wait('@cluster-details').then(() => {
      utils.setLastWizardSignal('CLUSTER_INSTALLING');
    });

    cy.wait('@cluster-details', { timeout: 10 * 1000 }).then(() => {
      cy.get('#cluster-progress-status-value').should('contain.text', 'Installing');
    });
  });
});
