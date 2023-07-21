import { Alert } from '../components/Alert';

export class StoragePage {
  constructor() {
    cy.get('.cluster-wizard').as(StoragePage.name);
  }

  static get alias() {
    return `@${StoragePage.name}`;
  }

  get body() {
    return cy.get(StoragePage.alias);
  }

  get diskLimitationAlert() {
    return new Alert(StoragePage.alias, 'diskLimitationsAlert');
  }

  get diskFormattingAlert() {
    return new Alert(StoragePage.alias, 'alert-format-bootable-disks');
  }
}
