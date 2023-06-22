import { fakeClusterId } from '../../fixtures/cluster/base-cluster';
import { EventsModalControl } from '../modals/EventsModal';

export class ClusterPage {
  constructor() {
    cy.get('.cluster-wizard').as(ClusterPage.name);
  }

  static get alias() {
    return `@${ClusterPage.name}`;
  }

  static visit(options?: Partial<Cypress.VisitOptions>) {
    cy.visit(`/clusters/${fakeClusterId}`, options);
  }

  get body() {
    return cy.get(ClusterPage.alias);
  }

  get wizardBody() {
    return cy.get('.pf-c-wizard__main-body');
  }

  get wizardFooter() {
    return cy.get('.cluster-wizard-step__footer');
  }

  get eventsModalControl() {
    return new EventsModalControl(ClusterPage.alias).body;
  }
}
