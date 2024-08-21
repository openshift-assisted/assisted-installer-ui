export class NewClusterPage {
  static visit(options?: Partial<Cypress.VisitOptions>) {
    return cy.visit('/assisted-installer/clusters/~new', options);
  }
}
