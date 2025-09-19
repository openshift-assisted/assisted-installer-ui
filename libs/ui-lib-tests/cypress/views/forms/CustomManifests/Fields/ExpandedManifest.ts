export const ExpandedManifest = (parentAlias: string, index: number) => ({
  fileName: () => {
    return cy.get(parentAlias).findByTestId(/filename-\d+/);
  },
  fileNameError: () => {
    return cy.get(parentAlias).find('.pf-v6-c-form__helper-text .pf-m-error');
  },
  fileUpload: () => {
    return cy.get(parentAlias).find('input[type="file"]');
  },
  fileUploadError: () => {
    return cy.get(parentAlias).find('.pf-v6-c-form__helper-text .pf-m-error');
  },
  remove: () => {
    return cy.get(parentAlias).findByTestId(`remove-manifest-${index}`);
  },
});
