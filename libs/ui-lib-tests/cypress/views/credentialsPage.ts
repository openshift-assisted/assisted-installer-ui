export const credentialsPage = {
  getConsentCheckbox: () => cy.get('#credentials-download-agreement'),
  checkConsent: () => credentialsPage.getConsentCheckbox().check(),
};
