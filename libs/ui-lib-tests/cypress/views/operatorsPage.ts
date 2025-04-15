export const operatorsPage = {
  openshiftVirtualization: () => {
    return cy.get('#form-input-cnv-field');
  },
  singleOperatorsToggle: () => {
    return cy.contains('Single Operators ');
  },
};
