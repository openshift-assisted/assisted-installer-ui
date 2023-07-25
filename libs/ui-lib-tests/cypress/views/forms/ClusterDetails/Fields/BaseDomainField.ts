export class BaseDomainField {
  static readonly alias = `@${BaseDomainField.name}`;
  static readonly selector = '#form-control__form-input-baseDnsDomain-field';

  static init(ancestorAlias: string) {
    cy.findWithinOrGet(BaseDomainField.selector, ancestorAlias).as(BaseDomainField.name);
    return BaseDomainField;
  }

  static findInputField() {
    return cy.get(BaseDomainField.alias).findByText(/base domain/i);
  }
}
