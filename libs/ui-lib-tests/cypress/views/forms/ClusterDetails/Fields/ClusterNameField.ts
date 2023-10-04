const selector = '#form-control__form-input-name-field';

export const ClusterName = (parentSelector: string) => ({
  get: () => {
    return cy.get(parentSelector).find(selector);
  },

  input: (clusterName = Cypress.env('CLUSTER_NAME')) => {
    ClusterName(parentSelector).get().clear().type(clusterName);
  },
});
