export const navbar = {
  navItemsShouldNotShowErrors: (timeout = 2000) => {
    cy.get('.wizard-nav-item-warning-icon', { timeout }).should('not.exist');
  },
  clickOnNavItem: (title) => {
    cy.get('.pf-c-wizard__nav-list').contains(title).should('be.enabled');
    cy.get('.pf-c-wizard__nav-list').contains(title).should('be.enabled').click({ force: true });
    cy.get('h2', { timeout: 10000 }).should('contain.text', title)
  },
};
