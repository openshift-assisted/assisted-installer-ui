import { isoDownloadLink } from '../fixtures/infra-envs';

export const bareMetalDiscoveryIsoModal = {
  getGenerateDiscoveryIsoModalId: () => {
    return cy.get('#generate-discovery-iso-modal');
  },
  validateDiscoveryIsoModalFields: () => {
    const modal = bareMetalDiscoveryIsoModal.getGenerateDiscoveryIsoModalId();
    modal.should('be.visible');
    modal.within(() => {
      cy.get('.pf-c-modal-box__title-text').should(
        'contain',
        'Add host', // TODO variation for SNO
      );
      cy.get('.pf-c-form__label-text').should('contain', 'SSH public key');
      cy.get('#sshPublicKey-filename')
        .invoke('attr', 'placeholder')
        .should('contain', 'Drag a file here or browse to upload');
      cy.get('#sshPublicKey-browse-button').invoke('attr', 'aria-disabled').should('contain', 'false');
    });
  },
  getMinimalIsoOption: () => {
    return cy.get(Cypress.env('formRadioImageTypeMinIsoFieldId'));
  },
  getSshPublicKey: () => {
    return cy.get(Cypress.env('sshPublicKeyFieldId'));
  },
  inputSshPublicKey: (sshKey = Cypress.env('SSH_PUB_KEY')) => {
    bareMetalDiscoveryIsoModal.getSshPublicKey().should('be.visible');
    if (sshKey) {
      bareMetalDiscoveryIsoModal.getSshPublicKey().fill(sshKey);
      bareMetalDiscoveryIsoModal.getSshPublicKey().invoke('text').should('contain', sshKey);
    } else {
      // trigger empty ssh key error field helper
      bareMetalDiscoveryIsoModal.getSshPublicKey().clear().type(' {backspace}');
    }
  },
  getInputSshKeyFieldHelper: () => {
    return cy.get(Cypress.env('sshPulicKeyFieldHelperId'));
  },
  getEnableProxy: () => {
    return cy.get('#form-checkbox-enableProxy-field');
  },
  getHttpProxyFieldHelper: () => {
    return cy.get('#form-input-httpProxy-field-helper');
  },
  getHttpsProxyFieldHelper: () => {
    return cy.get('#form-input-httpsProxy-field-helper');
  },
  getNoProxyFieldHelper: () => {
    return cy.get('#form-input-noProxy-field-helper');
  },
  getHttpProxyInput: () => {
    return cy.get('#form-input-httpProxy-field');
  },
  getHttpsProxyInput: () => {
    return cy.get('#form-input-httpsProxy-field');
  },
  getNoProxyInput: () => {
    return cy.get('#form-input-noProxy-field');
  },
  getHostNameInputFieldHelper: () => {
    return cy.get('#form-input-hostname-field-helper');
  },
  validateChangeHostnameHelperTextError: (msg) => {
    cy.get('.pf-m-error').should('contain', msg);
  },
  validateNeverShareWarning: () => {
    cy.get('.pf-c-modal-box__body > .pf-c-alert').should('contain', Cypress.env('neverShareWarningText'));
  },
  getGenerateDiscoveryIso: () => {
    return cy.get(`.pf-c-modal-box__footer > .pf-m-primary`).contains('Generate Discovery ISO');
  },
  getGeneratingButton: () => {
    return cy.get(`.pf-c-modal-box__footer > .pf-m-primary`).contains('Generating');
  },
  getAddHostsInstructions: () => {
    return cy.contains('Adding hosts instructions').title();
  },
  getAddHostsButton: () => {
    return cy.get('#host-inventory-button-download-discovery-iso');
  },
  getEditISO: () => {
    return cy.get('[data-testid="edit-iso-btn"]');
  },
  getImageTypeField: () => {
    return cy.get(Cypress.env('imageTypeFieldId'));
  },
  openImageTypeDropdown: () => {
    bareMetalDiscoveryIsoModal.getImageTypeField().find('button.pf-c-dropdown__toggle').click();
  },
  getImageTypeDropdown: () => {
    return bareMetalDiscoveryIsoModal.getImageTypeField().find('.pf-c-dropdown__menu');
  },
  getSelectedImageType: () => {
    return bareMetalDiscoveryIsoModal.getImageTypeField().find('.pf-c-dropdown__toggle-text')
  },
  selectImageType: (typeLabel: string) => {
    bareMetalDiscoveryIsoModal.openImageTypeDropdown();
    bareMetalDiscoveryIsoModal.getImageTypeDropdown().within(() => {
      cy.get('li').contains(typeLabel).click();
    });
    bareMetalDiscoveryIsoModal.getSelectedImageType().should(
        'contain',
        typeLabel,
    );
  },
  getCancelGenerateDiscoveryIsoButton: () => {
    return cy.get('.pf-c-modal-box__footer > .pf-m-link');
  },
  browseAndUploadSshKey: (fileName) => {
    cy.get('input[type="file"]').attachFile(fileName);
  },
  dragAndDropSshKey: (fileName) => {
    cy.get('input[type="file"]').attachFile(fileName, {
      subjectType: 'drag-n-drop',
    });
  },
  setProxyValues: (httpProxy = Cypress.env('HTTP_PROXY'), httpsProxy = Cypress.env('HTTP_PROXY'), noProxy = null) => {
    bareMetalDiscoveryIsoModal.getEnableProxy().check();
    if (httpProxy) {
      bareMetalDiscoveryIsoModal.getHttpProxyInput().should('be.visible');
      bareMetalDiscoveryIsoModal.getHttpProxyInput().fill(httpProxy);
      bareMetalDiscoveryIsoModal.getHttpProxyInput().should('have.value', httpProxy);
    }
    if (httpsProxy) {
      bareMetalDiscoveryIsoModal.getHttpsProxyInput().should('be.visible');
      bareMetalDiscoveryIsoModal.getHttpsProxyInput().fill(httpsProxy);
      bareMetalDiscoveryIsoModal.getHttpsProxyInput().should('have.value', httpsProxy);
    }
    if (noProxy) {
      bareMetalDiscoveryIsoModal.getNoProxyInput().should('be.visible');
      bareMetalDiscoveryIsoModal.getNoProxyInput().fill(noProxy);
      bareMetalDiscoveryIsoModal.getNoProxyInput().should('have.value', noProxy);
    }
  },
  waitForIsoGeneration: (timeout = Cypress.env('GENERATE_ISO_TIMEOUT')) => {
    cy.get('h4', { timeout: timeout }).should('contain', Cypress.env('isoReadyToDownloadText'));
  },
  verifyDownloadIsoLinks: () => {
    return cy
      .get("[aria-label='Copyable input']")
      .should('have.length', 2)
      .each((downloadLink) => {
        cy.wrap(downloadLink).should('contain.value', isoDownloadLink);
      });
  },
  getEditIsoButton: () => {
    return cy.get('[data-testid=edit-iso-btn]');
  },
  getCloseIsoButton: () => {
    return cy.get('[data-testid=close-iso-btn]');
  },
};
