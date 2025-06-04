export class EventsModalControl {
  constructor(parentAlias: string) {
    cy.get(parentAlias).find('#cluster-events-button').as(EventsModalControl.name);
  }

  get body() {
    return cy.get(EventsModalControl.alias);
  }

  static get alias() {
    return `@${EventsModalControl.name}`;
  }
}

export class EventsModal {
  constructor() {
    cy.get('#events-modal').as(EventsModal.name);
  }

  static get alias() {
    return `@${EventsModal.name}`;
  }

  get body() {
    return cy.get(EventsModal.alias);
  }

  get pagination() {
    return new PaginationControl(EventsModal.alias);
  }

  get contents() {
    return this.body.find('.pf-v6-c-table__tbody tr');
  }

  get hostFilter() {
    return new HostFilterDropdown(EventsModal.alias);
  }

  get severityFilter() {
    return new SeverityFilterDropdown(EventsModal.alias);
  }

  get messageFilter() {
    return this.body.find('#search-text');
  }

  get spinner() {
    return this.body.find('.pf-l-bullseye');
  }
}

class PaginationControl {
  constructor(parentAlias: string) {
    cy.get(parentAlias).find('.pf-v6-c-pagination').as(PaginationControl.name);
  }

  static get alias() {
    return `@${PaginationControl.name}`;
  }

  get body() {
    return cy.get(PaginationControl.alias);
  }

  get next() {
    return this.body.find('[data-action=next]');
  }

  get previous() {
    return this.body.find('[data-action=previous]');
  }

  get first() {
    return this.body.find('[data-action=first]');
  }

  get last() {
    return this.body.find('[data-action=last]');
  }

  get menuText() {
    return this.body.find('.pf-v6-c-menu-toggle__text');
  }

  get menu() {
    return this.body.find('#events-pagination-bottom-toggle');
  }

  perPageOption(num: number) {
    // PF6 renders dropdown menus at the body
    return cy.get('body').find(`[data-action=per-page-${num}]`);
  }
}

class HostFilterDropdown {
  constructor(parentAlias: string) {
    cy.get('body')
      .find('#cluster-events-hosts-dropdown-button')
      .parent()
      .as(HostFilterDropdown.name);
  }

  static get alias() {
    return `@${HostFilterDropdown.name}`;
  }

  get control() {
    return cy.get(HostFilterDropdown.alias).find('#cluster-events-hosts-dropdown-button');
  }

  get body() {
    return cy.get(HostFilterDropdown.alias);
  }

  option(id: string) {
    // PF6 renders dropdown menus at the body
    return cy.get('body').find(`#checkbox-${id}`);
  }
}

class SeverityFilterDropdown {
  constructor(parentAlias: string) {
    cy.get(parentAlias)
      .find('#cluster-events-severity-dropdown-button')
      .parent()
      .as(SeverityFilterDropdown.name);
  }

  static get alias() {
    return `@${SeverityFilterDropdown.name}`;
  }

  get body() {
    return cy.get(SeverityFilterDropdown.alias);
  }

  get control() {
    return this.body.find('#cluster-events-severity-dropdown-button');
  }

  option(severity: string) {
    // PF6 renders dropdown menus at the body
    return cy.get('body').find(`[data-testid=${severity}-filter-option]`);
  }
}
