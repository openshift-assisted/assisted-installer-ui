export const storagePage = {
  validateODFUsage: (
    numMasters: number = Cypress.env('NUM_MASTERS'),
    numWorkers: number = Cypress.env('NUM_WORKERS'),
  ) => {
    cy.get('td[data-label="ODF Usage"]')
      .should('have.length', numMasters + numWorkers)
      .each((hostRole, idx) => {
        const isMaster = idx <= numMasters - 1;
        if (isMaster) {
          expect(hostRole).to.contain('Excluded for ODF');
        } else {
          expect(hostRole).to.contain('Use ODF');
        }
      });
  },
  validateNumberOfDisks: (
    numMasters: number = Cypress.env('NUM_MASTERS'),
    numWorkers: number = Cypress.env('NUM_WORKERS'),
  ) => {
    cy.get('td[data-label="Number of disks"]')
      .should('have.length', numMasters + numWorkers)
      .each((hostDisk) => {
        expect(hostDisk).to.contain('3');
      });
  },
  getSkipFormattingCheckbox: (hostId: string, indexSelect: number) => {
    return cy.get(`input[id="select-formatted-${hostId}-${indexSelect}"]`);
  },
  validateSkipFormattingDisks: (hostId: string, numDisks: number) => {
    cy.get("td[data-label='Format?']").should('have.length', numDisks);
    //Checking if checkboxes are checked/unchecked
    storagePage.getSkipFormattingCheckbox(hostId, 0).should('not.be.checked');
    storagePage.getSkipFormattingCheckbox(hostId, 1).should('be.checked');
    storagePage.getSkipFormattingCheckbox(hostId, 2).should('be.checked');
    //Checking if checkboxes are enabled/disabled
    storagePage.getSkipFormattingCheckbox(hostId, 0).should('be.enabled');
    storagePage.getSkipFormattingCheckbox(hostId, 1).should('be.enabled');
    storagePage.getSkipFormattingCheckbox(hostId, 2).should('be.disabled');
  },
  validateSkipFormattingWarning: () => {
    cy.get('.pf-c-alert__title').should(
      'contain.text',
      'There might be issues with the boot order',
    );
    cy.get('.pf-c-alert__description').should(
      'contain.text',
      'You have opted out of formatting bootable disks on some hosts. To ensure the hosts reboot into the expected installation disk, manual user intervention might be required during OpenShift installation.',
    );
  },
  validateSkipFormattingIcon: (diskId: string) => {
    //If a disk is skip formatting validate that warning icon is shown
    cy.get(`[data-testid="disk-row-${diskId}"] [data-testid="disk-name"]`).within(
      (/* $diskRow */) => {
        cy.get('[role="img"]').should('have.attr', 'fill', '#f0ab00');
      },
    );
  },
};

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

class Alert {
  constructor(parentAlias: string, dataTestId?: string) {
    dataTestId
      ? cy.get(parentAlias).findByTestId(dataTestId).as(Alert.name)
      : cy.get(parentAlias).find('.pf-c-alert').as(Alert.name);
  }

  static get alias() {
    return `@${Alert.name}`;
  }

  get body() {
    return cy.get(Alert.alias);
  }

  get title() {
    return this.body.find('.pf-c-alert__title');
  }

  get description() {
    return this.body.find('.pf-c-alert__description');
  }
}
