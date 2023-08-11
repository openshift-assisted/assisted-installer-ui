export class CustomManifestsField {
  static readonly alias = `@${CustomManifestsField.name}`;
  static readonly selector = '#form-control__form-input-addCustomManifest-field';

  static init(ancestorAlias?: string) {
    cy.findWithinOrGet(CustomManifestsField.selector, ancestorAlias).as(CustomManifestsField.name);
    return CustomManifestsField;
  }

  static findCheckbox() {
    return cy.get(CustomManifestsField.alias).findByRole('checkbox', {
      name: /include custom manifests/i,
    });
  }
}
