export default class ClusterPage {
  static visit(options?: Partial<Cypress.VisitOptions>) {
    return cy.visit(`/clusters/${Cypress.env('clusterId')}`, options);
  }

  static get wizardBody() {
    return cy.get('.pf-c-wizard__main-body');
  }

  static get wizardFooter() {
    return cy.get('.cluster-wizard-step__footer');
  }
}
