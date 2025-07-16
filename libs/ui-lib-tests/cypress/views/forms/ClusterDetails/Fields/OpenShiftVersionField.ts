export class OpenShiftVersionField {
  static readonly alias = `@${OpenShiftVersionField.name}`;
  static readonly selector = '#form-control__form-input-openshiftVersion-field';

  static init(ancestorAlias?: string) {
    cy.findWithinOrGet(OpenShiftVersionField.selector, ancestorAlias).as(
      OpenShiftVersionField.name,
    );

    return OpenShiftVersionField;
  }

  static findLabel() {
    return cy.get(OpenShiftVersionField.alias).findByText(/openshift version/i);
  }

  static findDropdown() {
    return cy.get(OpenShiftVersionField.alias).find('#form-input-openshiftVersion-field');
  }

  static selectVersion(version: string) {
    OpenShiftVersionField.findDropdown().click();
    // Wait for dropdown to be expanded and items to be visible
    cy.get('#form-input-openshiftVersion-field-dropdown .pf-c-dropdown__menu').should('be.visible');
    // Select by clicking the <a> element with the matching value attribute
    cy.get(
      `#form-input-openshiftVersion-field-dropdown a[value="${version}"][role="menuitem"]`,
    ).click();
  }
}
