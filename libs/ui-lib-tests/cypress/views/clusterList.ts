export const clusterListPage = {
  getClusterByName: (clusterName = Cypress.env('CLUSTER_NAME')) => {
    return cy.get(`${Cypress.env('clusterRowIdPrefix')}${clusterName}`).scrollIntoView();
  },
  getClustersTable: () => {
    cy.get(Cypress.env('clustersTableAriaLabel'));
  },
  getEmptyStateNewClusterButton: () => {
    return cy.get(Cypress.env('emptyStateNewClusterButtonId'));
  },
  getCreateNewClusterButton: () => {
    return cy.get(Cypress.env('createNewClusterId')).scrollIntoView();
  },
  openCluster: (clusterName = Cypress.env('CLUSTER_NAME')) => {
    cy.getClusterNameLinkSelector(clusterName).click();
    cy.get('.pf-c-breadcrumb__list > :nth-child(3)').contains(clusterName);
    cy.get(Cypress.env('clusterNameFieldId')).should('have.value', clusterName);
  },
  deleteCluster: (clusterName = Cypress.env('CLUSTER_NAME')) => {
    cy.get(`${Cypress.env('clusterRowIdPrefix')}${clusterName}`)
      .scrollIntoView()
      .should('be.visible');
    cy.get(`${Cypress.env('clusterRowIdPrefix')}${clusterName}`).within(() => {
      cy.get(Cypress.env('actionsButtonAriaLabel')).click();
    });
    cy.get(`${Cypress.env('clusterRowIdPrefix')}${clusterName}`)
      .scrollIntoView()
      .should('be.visible');
    cy.get(`${Cypress.env('buttonDeleteIdPrefix')}${clusterName}`).click();
    cy.get(Cypress.env('deleteClusterSubmit')).should('be.visible');
    cy.get(Cypress.env('deleteClusterSubmit')).click();
    cy.get(`${Cypress.env('clusterRowIdPrefix')}${clusterName}`).should('not.exist');
  },
  getRefreshClusterListButton: () => {
    return cy.get(Cypress.env('refreshButtonAriaLabel'));
  },
  getExtraActionsDropdown: () => {
    return cy.get(Cypress.env('clusterListExtraActionsDropdown'));
  },
  filterClusterList: (filter) => {
    cy.get(Cypress.env('filterInputArialabel')).fill(filter);
  },
  waitForProvider: (provider, timeout = 600000) => {
    cy.get('tbody > tr')
      .eq(1) // always assume it is most recent cluster named x
      .within(() => {
        cy.get('td[data-label="Provider (Location)"]', {
          timeout: timeout,
        }).should('contain', provider);
      });
  },
  filterSearchString: (searchString) => {
    if (searchString) {
      cy.get(Cypress.env('searchStringId')).fill(searchString);
    } else {
      cy.get(Cypress.env('searchStringId')).clear();
    }
  },
  getFilterStatus: () => {
    return cy.get(Cypress.env('clusterListFilterStatusId'));
  },
  filterByStatus: (status) => {
    clusterListPage.getFilterStatus().click();
    cy.get('.pf-c-select__menu').contains(status).click();
    clusterListPage.getFilterStatus().click();
  },
  validateClusterNameIsVisibleInClusterList: (clusterName = Cypress.env('CLUSTER_NAME')) => {
    cy.newByDataTestId(`cluster-name-${clusterName}`).should('be.visible');
  },
};
