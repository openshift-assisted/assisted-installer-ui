import { pullSecret } from '../fixtures';

export const clusterDetailsPage = {
  getClusterNameField: () => {
    return cy.get(Cypress.expose('clusterNameFieldId'));
  },
  inputClusterName: (clusterName = Cypress.expose('CLUSTER_NAME')) => {
    clusterDetailsPage.getClusterNameField().should('be.visible').clear().type(clusterName);
  },
  getOpenshiftVersionField: () => {
    return cy.get(Cypress.expose('openshiftVersionFieldId'));
  },
  openOpenshiftVersionDropdown: () => {
    clusterDetailsPage.getOpenshiftVersionField().click();
  },
  getOpenshiftVersionDropdown: () => {
    return cy.get(`${Cypress.expose('openshiftVersionFieldId')}-dropdown`);
  },
  getSelectedOpenShiftVersion: () => {
    return clusterDetailsPage.getOpenshiftVersionField().find('.pf-v6-c-menu-toggle__text');
  },
  inputOpenshiftVersion: (version = Cypress.expose('OPENSHIFT_VERSION')) => {
    clusterDetailsPage.openOpenshiftVersionDropdown();
    clusterDetailsPage.getOpenshiftVersionDropdown().within(() => {
      cy.get('li').contains(version).click();
    });
    clusterDetailsPage.getSelectedOpenShiftVersion().should('contain.text', `OpenShift ${version}`);
  },
  clickLinkAllAvailableVersions: () => {
    clusterDetailsPage.getOpenshiftVersionDropdown().within(() => {
      cy.get('li').contains('Show all available versions').click();
    });
  },
  getPullSecretCheckbox: () => {
    return cy.get('#checkbox-pull-secret');
  },
  getPullSecret: () => {
    return cy.get(Cypress.expose('pullSecretFieldId'));
  },
  getPullSecretFieldHelper: () => {
    return cy.get(Cypress.expose('pullSecretFieldHelperId'));
  },
  inputPullSecret: (pullSecretValue = pullSecret) => {
    clusterDetailsPage.getPullSecret().clear();
    cy.pasteText(Cypress.expose('pullSecretFieldId'), pullSecretValue);
    clusterDetailsPage.getPullSecret().should('contain.text', pullSecretValue);
  },
  checkAiTechSupportLevel: () => {
    cy.get(Cypress.expose('assistedInstallerSupportLevel'))
      .should('be.visible')
      .should('contain.text', Cypress.expose('techPreviewSupportLevel'));
  },
  checkSnoDevSupportLevel: () => {
    cy.get(Cypress.expose('snoSupportLevel'))
      .should('be.visible')
      .should('contain.text', Cypress.expose('devPreviewSupportLevel'));
  },
  getBaseDnsDomain: () => {
    return cy.get(Cypress.expose('baseDnsDomainFieldId'));
  },
  inputBaseDnsDomain: (dns = Cypress.expose('DNS_DOMAIN_NAME')) => {
    clusterDetailsPage.getBaseDnsDomain().clear().type(dns).should('have.value', dns);
  },
  getStaticIpNetworkConfig: () => {
    return cy.get(Cypress.expose('staticIpNetworkConfigFieldId'));
  },
  getCpuArchitectureField: () => {
    return cy.get(Cypress.expose('cpuArchitectureFieldId'));
  },
  openCpuArchitectureDropdown: () => {
    clusterDetailsPage.getCpuArchitectureField().click();
  },
  getCpuArchitectureDropdown: () => {
    return cy.get(`${Cypress.expose('cpuArchitectureFieldId')}-dropdown`);
  },
  getSelectedCpuArchitecture: () => {
    return clusterDetailsPage.getCpuArchitectureField().find('.pf-v6-c-menu-toggle__text');
  },
  selectCpuArchitecture: (cpuArchitecture) => {
    clusterDetailsPage.openCpuArchitectureDropdown();
    clusterDetailsPage.getCpuArchitectureDropdown().within(() => {
      cy.get('li').contains(cpuArchitecture).click();
    });
    clusterDetailsPage
      .getSelectedCpuArchitecture()
      .invoke('text')
      .should('match', new RegExp(cpuArchitecture, 'i'));
  },
  CpuArchitectureExists: (cpuArchitecture) => {
    clusterDetailsPage.getCpuArchitectureDropdown().within(() => {
      cy.get('li').contains(cpuArchitecture).should('exist');
    });
  },
  CpuArchitectureNotExists: (cpuArchitecture) => {
    clusterDetailsPage.getCpuArchitectureDropdown().within(() => {
      cy.get('li').contains(cpuArchitecture).should('not.exist');
    });
  },
  getRedHatDnsServiceCheck: () => {
    return cy.get(Cypress.expose('useRedHatDnsServiceFieldId'));
  },
  setRedHatDnsService: () => {
    // set first option val to dnsDomain
    cy.get(`#form-input-baseDnsDomain-field > option`)
      .eq(0)
      .then((option) => {
        Cypress.expose('route53Dns', option.val());
      });
  },
  enableStaticNetworking: () => {
    cy.get(`.pf-v6-c-radio__label:contains(${Cypress.expose('enableStaticIpRadioButtonText')})`)
      .scrollIntoView()
      .click({ force: true });
  },
  validateInputNameFieldHelper: (status) => {
    cy.get(`[aria-label='Validation'] > svg`)
      .invoke('attr', 'fill')
      .should('contain.text', status === 'fail' ? '#c9190b' : '#3e8635');
  },
  getClusterNameFieldValidator: () => {
    return cy.get(Cypress.expose('clusterNameFieldValidator'));
  },
  validateInputNameFieldHelperError: (...childNums: number[]) => {
    clusterDetailsPage.getClusterNameFieldValidator().click();
    for (let i = 0; i < childNums.length; i++) {
      cy.get(`[id^=popover-pf-] > ul > :nth-child(${childNums[i]})`).should(
        'have.class',
        'pf-v6-c-helper-text__item pf-m-error pf-m-dynamic',
      );
    }
  },
  getInputDnsDomainFieldHelper: () => {
    return cy.get(Cypress.expose('baseDnsDomainFieldHelperId'));
  },
  getClusterDetailsBody: () => {
    return cy.get('.pf-l-grid');
  },
  getCustomManifestCheckbox: () => {
    return cy.get('#form-input-addCustomManifest-field');
  },
  getExternalPlatformIntegrationStaticField: () => {
    return cy.get('#form-static-platform-field');
  },
  clickClusterDetailsBody: () => {
    cy.get('#wizard-cluster-details__form').click();
  },
  validateInputDnsDomainFieldHelper: (msg) => {
    cy.get(Cypress.expose('baseDnsDomainFieldHelperErrorId')).should('contain', msg);
  },
  clearPullSecret: () => {
    cy.get(Cypress.expose('pullSecretFieldId')).clear().blur();
  },
  validateInputPullSecretFieldHelper: (msg) => {
    cy.get(Cypress.expose('pullSecretFieldHelperErrorId')).should('contain', msg);
  },
  getControlPlaneNodesField: () => {
    return cy.get(Cypress.expose('controlPlaneNodesFieldId'));
  },
  openControlPlaneNodesDropdown: () => {
    clusterDetailsPage.getControlPlaneNodesField().click();
  },
  getControlPlaneNodeDropdown: () => {
    return cy.get(`${Cypress.expose('controlPlaneNodesFieldId')}-dropdown`);
  },
  getSelectedControlPlaneNode: () => {
    return clusterDetailsPage.getControlPlaneNodesField().find('.pf-v6-c-menu-toggle__text');
  },
  selectControlPlaneNodeOption: (controlPlaneCount) => {
    clusterDetailsPage.openControlPlaneNodesDropdown();
    clusterDetailsPage.getControlPlaneNodeDropdown().within(() => {
      cy.get('li').contains(controlPlaneCount).click();
    });
    clusterDetailsPage
      .getSelectedControlPlaneNode()
      .invoke('text')
      .should('match', new RegExp(controlPlaneCount, 'i'));
  },
};
