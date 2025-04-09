export const operatorsPage = {
  openshiftVirtualization: () => {
    return cy.get('#form-checkbox-useContainerNativeVirtualization-field');
  },
  migrationToolkitForVirtualization: () => {
    return cy.get('#form-checkbox-useMigrationToolkitforVirtualization-field');
  },
  singleOperatorsToggle: () => {
    return cy.contains('Single Operators ');
  },
};
