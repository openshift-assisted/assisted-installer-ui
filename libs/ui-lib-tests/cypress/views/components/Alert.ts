export class Alert {
  constructor(parentAlias: string, dataTestId?: string) {
    dataTestId
      ? cy.get(parentAlias).findByTestId(dataTestId).as(Alert.name)
      : cy.get(parentAlias).find('.pf-c-alert').as(Alert.name);
  }

  static get alias() {
    return `@${Alert.name}`;
  }

  get body() {
    return cy.get(Alert.alias);
  }

  get title() {
    return this.body.find('.pf-c-alert__title');
  }

  get description() {
    return this.body.find('.pf-c-alert__description');
  }
}
