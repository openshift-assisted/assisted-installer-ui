export const operatorsPage = {
  openshiftVirtualization: () => {
    return cy.get('#form-checkbox-useContainerNativeVirtualization-field');
  },
  singleOperatorsToggle: () => {
    return cy.contains('Single Operators ');
  },
};
