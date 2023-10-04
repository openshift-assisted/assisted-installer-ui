declare namespace Cypress {
  interface Chainable {
    /**
     * If `ancestorAlias` is defined, executes `cy.get(ancestorAlias).find(childSelector)`. Otherwise, executes `cy.get(childSelector)`.
     * @param childSelector The CSS selector
     * @param ancestorAlias The alias of the child's ancestor
     */
    findWithinOrGet(childSelector: string, ancestorAlias?: string): Chainable<JQuery<HTMLElement>>;
    pasteText(text: string): Chainable<Element>;
    newByDataTestId(selector: string, timeout?: number): Chainable<JQuery<HTMLElement>>;
    hostDetailSelector(i: number, label: string, timeout?: number): Chainable<Element>;
    getClusterNameLinkSelector(clusterName?: string): Chainable<Element>;
    setTestEnvironment(conf: AIInterceptsConfig);
  }
}
