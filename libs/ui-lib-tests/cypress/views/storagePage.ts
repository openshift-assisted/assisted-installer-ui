export const storagePage = {
  validateODFUsage: (
    numMasters: number = Cypress.env('NUM_MASTERS'),
    numWorkers: number = Cypress.env('NUM_WORKERS'),
  ) => {
    cy.get('td[data-testid="use-odf"]')
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
    cy.get('td[data-testid="disk-number"]')
      .should('have.length', numMasters + numWorkers)
      .each((hostDisk) => {
        expect(hostDisk).to.contain('3');
      });
  },
  getSkipFormattingCheckbox: (hostId: string, indexSelect: number) => {
    return cy.get(`input[id="select-formatted-${hostId}-${indexSelect}"]`);
  },
  validateSkipFormattingDisks: (hostId: string, numDisks: number) => {
    cy.get("tr.pf-m-expanded td[data-testid='disk-formatted']").should('have.length', numDisks);
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
    cy.get('.pf-v6-c-alert__title').should(
      'contain.text',
      'There might be issues with the boot order',
    );
    cy.get('.pf-v6-c-alert__description').should(
      'contain.text',
      'You have opted out of formatting bootable disks on some hosts. To ensure the hosts reboot into the expected installation disk, manual user intervention might be required during OpenShift installation.',
    );
  },
  validateSkipFormattingIcon: (diskId: string, diskHost: string) => {
    //If a disk is skip formatting validate that warning icon is shown
    cy.get(`[data-testid="disk-row-${diskId}-host-${diskHost}"] [data-testid="disk-name"]`).within(
      (/* $diskRow */) => {
        cy.get('[role="img"]')
          .parent()
          .should('have.attr', 'class', 'pf-v6-c-icon__content pf-m-warning');
      },
    );
  },
};
