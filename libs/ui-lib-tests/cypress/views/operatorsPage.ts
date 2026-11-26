export const operatorsPage = {
  openshiftVirtualization: () => {
    return cy.get('#form-input-cnv-field');
  },
  singleOperatorsToggle: () => {
    return cy.contains('Single operators');
  },
  getVirtualizationBundleCheckbox: () => {
    return cy.get('#bundle-virtualization');
  },
  selectVirtualizationBundle: () => {
    return operatorsPage.getVirtualizationBundleCheckbox().check();
  },
  deselectVirtualizationBundle: () => {
    return operatorsPage.getVirtualizationBundleCheckbox().uncheck();
  },
  assertVirtualizationBundleSelected: (selected: boolean) => {
    operatorsPage
      .getVirtualizationBundleCheckbox()
      .should(selected ? 'be.checked' : 'not.be.checked');
  },
};
