export const storagePage = {
  validateODFUsage: (
    numMasters: number = Cypress.env('NUM_MASTERS'),
    numWorkers: number = Cypress.env('NUM_WORKERS'),
  ) => {
    cy.get(Cypress.env('odfUsageDataLabel'))
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
    cy.get(Cypress.env('diskNumberDataLabel'))
      .should('have.length', numMasters + numWorkers)
      .each((hostDisk) => {
        expect(hostDisk).to.contain('3');
      });
  },
  getSkipFormattingCheckbox: (hostId: string, indexSelect: number) => {
    return cy.get(`input[id="select-formatted-${hostId}-${indexSelect}"]`);
    ``;
  },
  validateSkipFormattingDisks: (hostId: string, numDisks: number) => {
    cy.get(Cypress.env('skipFormattingDataLabel')).should('have.length', numDisks);
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
    cy.get('.pf-c-alert__title').should('contain', Cypress.env('skipFormattingWarningTitle'));
    cy.get('.pf-c-alert__description').should('contain', Cypress.env('skipFormattingWarningDesc'));
  },
  validateSkipFormattingIcon: (diskId: string) => {
    //If a disk is skip formatting validate that warning icon is shown
    cy.get(`[data-testid="disk-row-${diskId}"] [data-testid="disk-name"] > svg > path`)
      .invoke('attr', 'd')
      .should('contain', Cypress.env('warningIconPath'));
  },
};
