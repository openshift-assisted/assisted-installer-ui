export class ClusterNameField {
  static readonly alias = `@${ClusterNameField}`;
  static readonly selector = '#form-control__form-input-name-field';

  static init(ancestorAlias?: string) {
    cy.findWithinOrGet(ClusterNameField.selector, ancestorAlias).as(ClusterNameField.name);
    return ClusterNameField;
  }

  static findInputField() {
    return cy.get(ClusterNameField.alias).findByRole('textbox', {
      name: /cluster name/i,
    });
  }
}
