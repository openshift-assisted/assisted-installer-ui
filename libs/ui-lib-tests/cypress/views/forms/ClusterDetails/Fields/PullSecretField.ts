export class PullSecretField {
  static readonly alias = `@${PullSecretField.name}`;
  static readonly selector = '#form-control__form-input-pullSecret-field';

  static init(ancestorAlias: string) {
    cy.findWithinOrGet(PullSecretField.selector, ancestorAlias).as(PullSecretField.name);
    return PullSecretField;
  }

  static findTextArea() {
    return cy.get(PullSecretField.alias).find('#form-input-pullSecret-field');
  }

  static inputPullSecret(pullSecret: string) {
    PullSecretField.findTextArea().clear();
    cy.pasteText('#form-input-pullSecret-field', pullSecret);
    PullSecretField.findTextArea().should('contain.text', pullSecret);
  }
}
