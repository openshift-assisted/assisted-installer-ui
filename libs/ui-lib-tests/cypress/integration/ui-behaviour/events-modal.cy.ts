import ClusterPage from '../../views/pages/ClusterPage';
import EventsModal from '../../views/modals/eventsModal';
import { hostIds } from '../../fixtures/hosts';

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
    EventsModal.eventsModalControl.click();
  });

  it('Can use pagination', () => {
    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[0]).eq('1');
        expect(res[1]).eq('10');
        expect(res[2]).eq('28');
      });
      EventsModal.contents.should('have.length', 10);
    });

    EventsModal.pagination.next.click();
    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[0]).eq('11');
        expect(res[1]).eq('20');
        expect(res[2]).eq('28');
      });
      EventsModal.contents.should('have.length', 10);
    });

    EventsModal.pagination.previous.click();
    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[0]).eq('1');
        expect(res[1]).eq('10');
        expect(res[2]).eq('28');
      });
      EventsModal.contents.should('have.length', 10);
    });

    EventsModal.pagination.last.click();
    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[0]).eq('21');
        expect(res[1]).eq('28');
        expect(res[2]).eq('28');
      });
      EventsModal.contents.should('have.length', 8);
    });

    EventsModal.pagination.first.click();
    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[0]).eq('1');
        expect(res[1]).eq('10');
        expect(res[2]).eq('28');
      });
      EventsModal.contents.should('have.length', 10);
    });

    EventsModal.pagination.menuText.click();
    EventsModal.pagination.perPageOption(50).click();
    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[0]).eq('1');
        expect(res[1]).eq('28');
        expect(res[2]).eq('28');
      });
      EventsModal.pagination.first.should('be.disabled');
      EventsModal.pagination.previous.should('be.disabled');
      EventsModal.pagination.next.should('be.disabled');
      EventsModal.pagination.last.should('be.disabled');
      EventsModal.contents.should('have.length', 28);
    });
  });

  it('Can use hosts filters', () => {
    EventsModal.hostFilter.control.click();
    EventsModal.hostFilter.option(hostIds[0]).click();

    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('7');
      });
      EventsModal.contents.should('have.length', 7);
    });

    EventsModal.hostFilter.option(hostIds[1]).click();
    EventsModal.hostFilter.option(hostIds[2]).click();
    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('21');
      });
      EventsModal.contents.should('have.length', 10);
    });

    EventsModal.hostFilter.option('cluster-level-action').click();
    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('28');
      });
      EventsModal.contents.should('have.length', 10);
    });
  });

  it('Can use severity filters', () => {
    EventsModal.severityFilter.control.click();

    EventsModal.severityFilter.option('info').click();
    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('20');
      });
    });

    EventsModal.severityFilter.option('warning').click();
    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('28');
      });
    });

    EventsModal.severityFilter.option('info').click();
    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('8');
      });
    });
  });

  it('Can use message filter', () => {
    EventsModal.messageFilter.type('registered');
    cy.wait(500); // UI debounce time
    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('4');
      });
    });

    EventsModal.messageFilter.clear();
    cy.wait(500); // UI debounce time
    cy.wait('@events').then(() => {
      EventsModal.pagination.menuText.then(($elem) => {
        const res = $elem
          .text()
          .match(/(\d+)\s\-\s(\d+)\sof\s(\d+)/)
          .slice(1, 4);
        expect(res[2]).eq('28');
      });
    });
  });
});
