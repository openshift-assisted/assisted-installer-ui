declare namespace Cypress {
  interface Chainable {
    pasteText(selector: string, text: string): Chainable<Element>;
    newByDataTestId(selector: string, timeout?: number): Chainable<JQuery<HTMLElement>>;
    hostDetailSelector(i: number, label: string, timeout?: number): Chainable<Element>;
    getClusterNameLinkSelector(clusterName?: string): Chainable<Element>;
    getIndexByName(selector: string, name: string, timeout?: number): Chainable<Element>;
    loadAiAPIIntercepts(conf: AIInterceptsConfig | null);
  }
}
