export const CollapsedManifest = (parentAlias: string, index: number) => ({
  error: () => {
    return cy.get(parentAlias).findByTestId('manifest-errors-label');
  },
  name: () => {
    return cy.get(parentAlias).findByTestId('manifest-name');
  },
  remove: () => {
    return cy.get(parentAlias).findByTestId(`remove-manifest-${index}`);
  },
});
