export const customManifestsPage = {
  getFileName: () => {
    return cy.get(Cypress.env('customManifestFileName'));
  },
  getFileNameError: () => {
    return cy.get(Cypress.env('helperTextError'));
  },
  getStartFromScratch: () => {
    return cy.get(Cypress.env('yamlContentAddContentButton'));
  },
  fileUpload: () => {
    return cy.get(Cypress.env('inputTypeFile'));
  },
  getYamlContentError: () => {
    return cy.get(Cypress.env('helperTextError'));
  },
  getAlertTitle: () => {
    return cy.get(Cypress.env('alertTitle'));
  },
  getLinkToAdd: () => {
    return cy.get(Cypress.env('addCustomManifests'));
  },
  getManifest1Id: () => {
    return cy.get(Cypress.env('manifest1Id'));
  },
  lastFileUpload: () => {
    return cy.get(Cypress.env('lastInputTypeFile'));
  },
  getRemoveManifestButton: () => {
    return cy.get(Cypress.env('removeManifestButton'));
  },
  getRemoveConfirmationButton: () => {
    return cy.get(Cypress.env('removeConfirmationButton'));
  },
};
