export class NewClusterPage {
  static visit(options?: Partial<Cypress.VisitOptions>) {
    return cy.visit('/clusters/~new', options);
  }
}
