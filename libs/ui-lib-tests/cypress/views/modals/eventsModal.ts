import ClusterPage from '../pages/ClusterPage';

export default class EventsModal {
  static get body() {
    return cy.get('#events-modal');
  }

  static get eventsModalControl() {
    return ClusterPage.wizardFooter.find('#cluster-events-button');
  }

  static get pagination() {
    return PaginationControl;
  }

  static get contents() {
    return EventsModal.body.find('.pf-c-table tr');
  }

  static get hostFilter() {
    return HostFilterDropdown;
  }

  static get severityFilter() {
    return SeverityFilterDropdown;
  }

  static get messageFilter() {
    return EventsModal.body.find('#search-text');
  }
}

class PaginationControl {
  static get body() {
    return EventsModal.body.find('.pf-c-pagination');
  }

  static get next() {
    return PaginationControl.body.find('[data-action=next]');
  }

  static get previous() {
    return PaginationControl.body.find('[data-action=previous]');
  }

  static get first() {
    return PaginationControl.body.find('[data-action=first]');
  }

  static get last() {
    return PaginationControl.body.find('[data-action=last]');
  }

  static get menuText() {
    return PaginationControl.body.find('.pf-c-options-menu__toggle-text');
  }

  static get menu() {
    return PaginationControl.body.find('.events-pagination-bottom-toggle');
  }

  static perPageOption(num: number) {
    return PaginationControl.body.find(`[data-action=per-page-${num}]`);
  }
}

class HostFilterDropdown {
  static get control() {
    return EventsModal.body.find('#cluster-events-hosts-dropdown-button');
  }

  static get body() {
    return HostFilterDropdown.control.parent().find('.pf-c-select__menu');
  }

  static option(id: string) {
    return HostFilterDropdown.body.find(`#checkbox-${id}`);
  }
}

class SeverityFilterDropdown {
  static get control() {
    return EventsModal.body.find('#cluster-events-severity-dropdown-button');
  }

  static get body() {
    return SeverityFilterDropdown.control.parent().find('.pf-c-select__menu');
  }

  static option(severity: string) {
    return SeverityFilterDropdown.body.find(`[data-testid=${severity}-filter-option]`);
  }
}
