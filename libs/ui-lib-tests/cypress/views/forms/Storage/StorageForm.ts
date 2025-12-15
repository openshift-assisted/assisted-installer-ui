import { Alert } from '../../reusableComponents/Alert';

export class StorageForm {
  static readonly alias = `@${StorageForm.name}`;
  static readonly selector = '.pf-v6-c-wizard__main-body';

  constructor() {
    cy.findWithinOrGet(StorageForm.selector).as(StorageForm.name);
  }

  get diskLimitationAlert() {
    return new Alert(StorageForm.alias, '[data-testid="diskLimitationsAlert"]');
  }

  get diskFormattingAlert() {
    return new Alert(StorageForm.alias, '[data-testid="alert-format-bootable-disks"]');
  }
}
