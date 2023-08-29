export class SnoField {
  static readonly alias = `@${SnoField.name}`;
  static readonly selector = '#form-control__form-input-highAvailabilityMode-field';

  static init(ancestorAlias?: string) {
    cy.findWithinOrGet(SnoField.selector, ancestorAlias).as(SnoField.name);
    return SnoField;
  }

  static findCheckbox() {
    return cy.get(SnoField.alias).find('#form-input-highAvailabilityMode-field');
  }
}
