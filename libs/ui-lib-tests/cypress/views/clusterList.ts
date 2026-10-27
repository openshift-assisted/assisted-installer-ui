export const clusterListPage = {
  getClusterByName: (clusterName = Cypress.expose('CLUSTER_NAME')) => {
    return cy.get(`${Cypress.expose('clusterRowIdPrefix')}${clusterName}`).scrollIntoView();
  },
  getClustersTable: () => {
    cy.get(Cypress.expose('clustersTableAriaLabel'));
  },
  getEmptyStateNewClusterButton: () => {
    return cy.get(Cypress.expose('emptyStateNewClusterButtonId'));
  },
  getCreateNewClusterButton: () => {
    return cy.get(Cypress.expose('createNewClusterId')).scrollIntoView();
  },

  deleteCluster: (clusterName = Cypress.expose('CLUSTER_NAME')) => {
    cy.get(`${Cypress.expose('clusterRowIdPrefix')}${clusterName}`)
      .scrollIntoView()
      .should('be.visible');
    cy.get(`${Cypress.expose('clusterRowIdPrefix')}${clusterName}`).within(() => {
      cy.get('button[aria-label="Actions"]').click();
    });
    cy.get(`${Cypress.expose('clusterRowIdPrefix')}${clusterName}`)
      .scrollIntoView()
      .should('be.visible');
    cy.get(`${Cypress.expose('buttonDeleteIdPrefix')}${clusterName}`).click();
    cy.get(Cypress.expose('deleteClusterSubmit')).should('be.visible');
    cy.get(Cypress.expose('deleteClusterSubmit')).click();
    cy.get(`${Cypress.expose('clusterRowIdPrefix')}${clusterName}`).should('not.exist');
  },
  getRefreshClusterListButton: () => {
    return cy.get('button[aria-label="Refresh"]');
  },
  getExtraActionsDropdown: () => {
    return cy.get(Cypress.expose('clusterListExtraActionsDropdown'));
  },
  filterClusterList: (filter) => {
    cy.get('input[aria-label="Filter"]').fill(filter);
  },
  waitForProvider: (provider, timeout = 600000) => {
    cy.get('tbody > tr')
      .eq(1) // always assume it is most recent cluster named x
      .within(() => {
        cy.get('td[data-label="Provider (Location)"]', {
          timeout: timeout,
        }).should('contain.text', provider);
      });
  },
  filterSearchString: (searchString) => {
    if (searchString) {
      cy.get(Cypress.expose('searchStringId')).fill(searchString);
    } else {
      cy.get(Cypress.expose('searchStringId')).clear();
    }
  },
  getFilterStatus: () => {
    return cy.get(Cypress.expose('clusterListFilterStatusId'));
  },
  filterByStatus: (status) => {
    clusterListPage.getFilterStatus().click();
    cy.get('.pf-v6-c-select__menu').contains(status).click();
    clusterListPage.getFilterStatus().click();
  },
  validateClusterNameIsVisibleInClusterList: (clusterName = Cypress.expose('CLUSTER_NAME')) => {
    cy.newByDataTestId(`cluster-name-${clusterName}`).should('be.visible');
  },
};
