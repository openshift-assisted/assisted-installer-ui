export const navbar = {
  navItemsShouldNotShowErrors: (timeout = 2000) => {
    cy.get('.wizard-nav-item-warning-icon', { timeout }).should('not.exist');
  },
  clickOnNavItem: (title) => {
    cy.get('.pf-v6-c-wizard__nav-list').contains(title).click();
  },
};
