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

  static findOpenshiftVersionField() {
    return cy.get('#form-input-openshiftVersion-field');
  }

  static findDropdown() {
    return cy.get('#form-input-openshiftVersion-field-dropdown');
  }

  static selectVersion(version: string) {
    OpenShiftVersionField.findOpenshiftVersionField().click();
    OpenShiftVersionField.findDropdown().within(() => {
      cy.findByRole('menuitem', { name: new RegExp(`openshift ${version}`, 'i') }).click();
    });
  }
}
