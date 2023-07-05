import { ClusterPage } from '../../views/pages/ClusterPage';
import { hostIds } from '../../fixtures/hosts';
import { EventsModal } from '../../views/modals/EventsModal';

let clusterPage;
let eventsModal;

describe('Events modal behavior', () => {
  const refreshTestSetup = () => {
    cy.setTestingEnvironment({
      activeSignal: 'READY_TO_INSTALL',
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  };

  before(refreshTestSetup);

  beforeEach(() => {
    refreshTestSetup();

    ClusterPage.visit();

    clusterPage = new ClusterPage();
    clusterPage.eventsModalControl.click();

    eventsModal = new EventsModal();
  });

  afterEach(() => {
    clusterPage = null;
    eventsModal = null;
  });

  it('Can use pagination', () => {
    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 10);

      eventsModal.pagination.first.should('be.disabled');
      eventsModal.pagination.previous.should('be.disabled');
    });

    eventsModal.pagination.next.click();
    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 10);

      eventsModal.pagination.first.should('be.enabled');
      eventsModal.pagination.previous.should('be.enabled');
      eventsModal.pagination.next.should('be.enabled');
      eventsModal.pagination.last.should('be.enabled');
    });

    eventsModal.pagination.last.click();
    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 8);

      eventsModal.pagination.first.should('be.enabled');
      eventsModal.pagination.previous.should('be.enabled');
      eventsModal.pagination.next.should('be.disabled');
      eventsModal.pagination.last.should('be.disabled');
    });

    eventsModal.pagination.first.click();
    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 10);

      eventsModal.pagination.first.should('be.disabled');
      eventsModal.pagination.previous.should('be.disabled');
      eventsModal.pagination.next.should('be.enabled');
      eventsModal.pagination.last.should('be.enabled');
    });

    eventsModal.pagination.menuText.click();
    eventsModal.pagination.perPageOption(50).click();
    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 28);
      eventsModal.pagination.first.should('be.disabled');
      eventsModal.pagination.previous.should('be.disabled');
      eventsModal.pagination.next.should('be.disabled');
      eventsModal.pagination.last.should('be.disabled');
    });
  });

  it('Can use hosts filters', () => {
    eventsModal.pagination.menuText.click();
    eventsModal.pagination.perPageOption(50).click();

    eventsModal.hostFilter.control.click();
    eventsModal.hostFilter.option(hostIds[0]).click();

    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 7);
    });

    eventsModal.hostFilter.option(hostIds[1]).click();
    eventsModal.hostFilter.option(hostIds[2]).click();
    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 21);
    });

    eventsModal.hostFilter.option('cluster-level-action').click();
    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 28);
    });
  });

  it('Can use severity filters', () => {
    eventsModal.pagination.menuText.click();
    eventsModal.pagination.perPageOption(50).click();
    eventsModal.severityFilter.control.click();

    eventsModal.severityFilter.option('info').click();
    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 20);
    });

    eventsModal.severityFilter.option('warning').click();
    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 28);
    });

    eventsModal.severityFilter.option('info').click();
    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 8);
    });

    eventsModal.severityFilter.option('warning').click();
    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 28);
    });
  });

  it('Can use message filter', () => {
    eventsModal.pagination.menuText.click();
    eventsModal.pagination.perPageOption(50).click();

    eventsModal.messageFilter.type('registered');
    cy.wait(500); // UI debounce time
    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 4);
    });

    eventsModal.messageFilter.clear();
    cy.wait(500); // UI debounce time
    cy.wait('@events').then(() => {
      eventsModal.contents.should('have.length', 28);
    });
  });
});
