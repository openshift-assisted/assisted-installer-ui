export class ClusterNameField {
  static readonly alias = `@${ClusterNameField.name}`;
  static readonly selector = '#form-control__form-input-name-field';

  static init(ancestorAlias?: string) {
    cy.findWithinOrGet(ClusterNameField.selector, ancestorAlias).as(ClusterNameField.name);
    return ClusterNameField;
  }

  static findInputField() {
    return cy.get(ClusterNameField.alias).findByText(/cluster name/i);
  }
}
