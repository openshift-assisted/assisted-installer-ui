export const operatorsPage = {
  openshiftVirtualization: () => {
    return cy.get('#form-input-cnv-field');
  },
  migrationToolkitForVirtualization: () => {
    return cy.get('#form-checkbox-useMigrationToolkitforVirtualization-field');
  },
  singleOperatorsToggle: () => {
    return cy.contains('Single Operators ');
  },
};
