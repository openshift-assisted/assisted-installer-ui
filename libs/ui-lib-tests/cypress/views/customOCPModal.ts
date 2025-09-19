export const customOCPModal = {
  getCustomOCPModalId: () => {
    return cy.get('#available-openshift-versions-modal');
  },
  inputVersionToSearch: (ocpVersion: string) => {
    cy.get('#typeahead-select-input').clear().type(ocpVersion);
  },
  getSearchResponse: (searchResponse: string) => {
    cy.get('#select-typeahead-listbox').within(() => {
      return cy.get('.pf-v6-c-menu__list-item').contains(searchResponse);
    });
  },
  selectFirstSearchResponse: (searchResponse: string) => {
    cy.get('#select-typeahead-listbox').within(() => {
      cy.get('.pf-v6-c-menu__list-item').contains(searchResponse).click();
    });
  },
  getSelectModalButton: () => {
    return customOCPModal
      .getCustomOCPModalId()
      .get('.pf-v6-c-modal-box__footer > button.pf-m-primary');
  },
  getCloseModalButton: () => {
    return customOCPModal
      .getCustomOCPModalId()
      .get('.pf-v6-c-modal-box__footer > button.pf-m-link');
  },
  getCloseModalIcon: () => {
    return customOCPModal
      .getCustomOCPModalId()
      .get('.pf-v6-c-modal-box__close > button.pf-m-plain');
  },
};
