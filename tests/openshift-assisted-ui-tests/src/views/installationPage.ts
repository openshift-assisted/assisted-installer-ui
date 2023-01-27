export const installationPage = {
  validateInstallConfigWarning: (msg) => {
    cy.get(`.pf-m-warning:contains(${msg})`);
  },
  waitForDownloadKubeconfigToBeEnabled: (timeout = 600000) => {
    cy.get(Cypress.env('clusterDetailButtonDownloadKubeconfigId'), {
      timeout: timeout,
    }).should('be.enabled');
  },
  downloadKubeconfigAndSetKubeconfigEnv: (kubeconfigFile, timeout = Cypress.env('KUBECONFIG_DOWNLOAD_TIMEOUT')) => {
    cy.get(Cypress.env('clusterDetailButtonDownloadKubeconfigId')).should('be.visible').click();
    cy.readFile(kubeconfigFile, { timeout: timeout })
      .should('have.length.gt', 50)
      .then((kubeconfig) => {
        Cypress.env('kubeconfig', kubeconfig);
      });
  },
  copyAllFiles: () => {
    installationPage.downloadKubeconfigAndSetKubeconfigEnv(
      Cypress.env('kubeconfigFile'),
      Cypress.env('KUBECONFIG_DOWNLOAD_TIMEOUT'),
    );
    cy.runCopyCmd(Cypress.env('kubeconfigFile'), '~/clusterconfigs/auth/kubeconfig');
    cy.runCopyCmd(Cypress.env('kubeconfigFile'), '~/kubeconfig');
    cy.runCopyCmd(
      Cypress.env('kubeconfigFile'),
      `${Cypress.env('BASE_REPO_DIR_REMOTE')}/linchpin-workspace/hooks/ansible/ocp-edge-setup/kubeconfig`,
    );
    cy.setKubeAdminPassword(Cypress.env('API_BASE_URL'), Cypress.env('clusterId'), true);
    cy.get('@kubeadmin-password').then((kubeadminPassword) => {
      cy.writeFile(Cypress.env('kubeadminPasswordFilePath'), kubeadminPassword);
    });
    cy.runCopyCmd(Cypress.env('kubeadminPasswordFilePath'), '~/clusterconfigs/auth/kubeadmin-password');
    cy.runCopyCmd(Cypress.env('kubeadminPasswordFilePath'), '~/kubeadmin-password');
    cy.runCopyCmd(
      Cypress.env('kubeadminPasswordFilePath'),
      `${Cypress.env('BASE_REPO_DIR_REMOTE')}/linchpin-workspace/hooks/ansible/ocp-edge-setup/kubeadmin-password`,
    );
    cy.setInstallConfig(Cypress.env('API_BASE_URL'), Cypress.env('clusterId'), true);
    cy.get('@install-config').then((installConfig) => {
      cy.writeFile(Cypress.env('installConfigFilePath'), installConfig);
    });
    cy.runCopyCmd(Cypress.env('installConfigFilePath'), '~/install-config.yaml');
    cy.runCopyCmd(
      Cypress.env('installConfigFilePath'),
      `${Cypress.env('BASE_REPO_DIR_REMOTE')}/linchpin-workspace/hooks/ansible/ocp-edge-setup/install-config.yaml`,
    );
  },
  waitForConsoleTroubleShootingHintToBeVisible: (timeout = Cypress.env('WAIT_FOR_CONSOLE_TIMEOUT')) => {
    cy.newByDataTestId(Cypress.env('clusterDetailClusterCredsTshootHintOpen'), timeout)
      .scrollIntoView()
      .should('be.visible');
  },
  progressStatusShouldContain: (status = 'Installed', timeout = Cypress.env('WAIT_FOR_PROGRESS_STATUS_INSTALLED')) => {
    cy.get(Cypress.env('clusterProgressStatusValueId')).scrollIntoView().should('be.visible');
    cy.get(Cypress.env('clusterProgressStatusValueId'), {
      timeout: timeout,
    }).should('contain', status);
  },
  operatorsPopover: {
    open: () => {
      cy.get(Cypress.env('operatorsProgressItem')).click();
    },
    validateListItemContents: (msg) => {
      cy.get('.pf-c-popover__body').within(() => {
        cy.get('li').should('contain', msg);
      });
    },
    close: () => {
      cy.get('.pf-c-popover__content > .pf-c-button > svg').should('be.visible').click();
    },
  },
};
