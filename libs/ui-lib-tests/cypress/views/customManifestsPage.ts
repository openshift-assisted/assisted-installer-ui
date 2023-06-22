export const customManifestsPage = {
  getFileName: () => {
    return cy.get('[data-testid=filename-0]');
  },
  getFileNameError: () => {
    return cy.get('div.pf-c-form__helper-text.pf-m-error');
  },
  getStartFromScratch: () => {
    return cy.get('.pf-c-file-upload .pf-c-empty-state__secondary > button');
  },
  fileUpload: () => {
    return cy.get('input[type="file"]');
  },
  getYamlContentError: () => {
    return cy.get('div.pf-c-form__helper-text.pf-m-error');
  },
  getAlertTitle: () => {
    return cy.get('div.pf-c-alert.pf-m-danger > h4.pf-c-alert__title');
  },
  getLinkToAdd: () => {
    return cy.get('[data-testid=add-manifest]');
  },
  getManifest1Id: () => {
    return cy.get('[data-testid=filename-1]');
  },
  lastFileUpload: () => {
    return cy.get('input[type="file"]:last');
  },
  getRemoveManifestButton: () => {
    return cy.get('[aria-label="remove manifest"]:last');
  },
  getRemoveConfirmationButton: () => {
    return cy.get('[data-testid=confirm-modal-submit]');
  },
};
