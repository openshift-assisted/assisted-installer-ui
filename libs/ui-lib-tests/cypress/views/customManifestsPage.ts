export const customManifestsPage = {
  getFileName: (index: number) => {
    return cy.findByTestId(`filename-${index}`);
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
    return cy.findByTestId('add-manifest');
  },
  lastFileUpload: () => {
    return cy.get('input[type="file"]:last');
  },
  getRemoveManifestButton: (index: number) => {
    return cy.findByTestId(`remove-manifest-${index}`);
  },
  getRemoveConfirmationButton: () => {
    return cy.findByTestId('confirm-modal-submit');
  },
};
