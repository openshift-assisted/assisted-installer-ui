import { ClusterPage } from '../../views/pages/ClusterPage';
import { hostIds } from '../../fixtures/hosts';
import { EventsModal } from '../../views/modals/EventsModal';

let clusterPage;
let eventsModal;

describe('Events modal behavior', () => {
  before(() => {
    cy.loadAiAPIIntercepts({
      activeSignal: 'READY_TO_INSTALL',
      activeScenario: 'AI_CREATE_MULTINODE',
    });
  });

  beforeEach(() => {
    cy.loadAiAPIIntercepts(null);

    ClusterPage.visit();

    clusterPage = new ClusterPage();
    clusterPage.eventsModalControl.click();

    eventsModal = new EventsModal();
    eventsModal.spinner.should('not.exist');
  });

  afterEach(() => {
    clusterPage = null;
    eventsModal = null;
  });

  it('Can use pagination', () => {
    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[0]).eq('1');
        expect(res[1]).eq('10');
        expect(res[2]).eq('28');
      });
      eventsModal.contents.should('have.length', 10);
    });

    eventsModal.pagination.next.click();
    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[0]).eq('11');
        expect(res[1]).eq('20');
        expect(res[2]).eq('28');
      });
      eventsModal.contents.should('have.length', 10);
    });

    eventsModal.pagination.previous.click();
    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[0]).eq('1');
        expect(res[1]).eq('10');
        expect(res[2]).eq('28');
      });
      eventsModal.contents.should('have.length', 10);
    });

    eventsModal.pagination.last.click();
    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[0]).eq('21');
        expect(res[1]).eq('28');
        expect(res[2]).eq('28');
      });
      eventsModal.contents.should('have.length', 8);
    });

    eventsModal.pagination.first.click();
    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[0]).eq('1');
        expect(res[1]).eq('10');
        expect(res[2]).eq('28');
      });
      eventsModal.contents.should('have.length', 10);
    });

    eventsModal.pagination.menuText.click();
    eventsModal.pagination.perPageOption(50).click();
    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[0]).eq('1');
        expect(res[1]).eq('28');
        expect(res[2]).eq('28');
      });
      eventsModal.pagination.first.should('be.disabled');
      eventsModal.pagination.previous.should('be.disabled');
      eventsModal.pagination.next.should('be.disabled');
      eventsModal.pagination.last.should('be.disabled');
      eventsModal.contents.should('have.length', 28);
    });
  });

  it('Can use hosts filters', () => {
    eventsModal.hostFilter.control.click();
    eventsModal.hostFilter.option(hostIds[0]).click();

    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('7');
      });
      eventsModal.contents.should('have.length', 7);
    });

    eventsModal.hostFilter.option(hostIds[1]).click();
    eventsModal.hostFilter.option(hostIds[2]).click();
    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('21');
      });
      eventsModal.contents.should('have.length', 10);
    });

    eventsModal.hostFilter.option('cluster-level-action').click();
    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('28');
      });
      eventsModal.contents.should('have.length', 10);
    });
  });

  it('Can use severity filters', () => {
    eventsModal.severityFilter.control.click();

    eventsModal.severityFilter.option('info').click();
    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('20');
      });
    });

    eventsModal.severityFilter.option('warning').click();
    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('28');
      });
    });

    eventsModal.severityFilter.option('info').click();
    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('8');
      });
    });
  });

  it('Can use message filter', () => {
    eventsModal.messageFilter.type('registered');
    cy.wait(500); // UI debounce time
    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('4');
      });
    });

    eventsModal.messageFilter.clear();
    cy.wait(500); // UI debounce time
    cy.wait('@events').then(() => {
      eventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('28');
      });
    });
  });
});
