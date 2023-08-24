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
    OpenShiftVersionField.findDropdown().within(() => {
      cy.findByRole('menuitem', { name: new RegExp(`openshift ${version}`, 'i') }).click();
    });
  }

  static isPatternflyDropdown() {
    OpenShiftVersionField.findDropdown().should('have.class', 'pf-c-dropdown');
  }
}
