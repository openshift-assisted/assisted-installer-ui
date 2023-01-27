declare namespace Cypress {
  interface Chainable {
    runCmd(cmd: string, setAlias?: boolean, failOnNonZeroExit?: boolean, timeout?: number): Chainable<Cypress.Exec>;
    runCmdOnNode(user: string, host: string, cmd: string): Chainable<Cypress.Exec>;
    runCopyCmd(src: string, dst: string, failOnNonZeroExit?: boolean, timeout?: number): Chainable<Cypress.Exec>;
    pasteText(selector: string, text: string): Chainable<Element>;
    setKubeAdminPassword(
      apiBaseUrl?: string,
      clusterId?: string,
      setAlias?: boolean,
      setEnvVar?: boolean,
    ): Chainable<Cypress.Exec>;
    setInstallConfig(
      apiBaseUrl?: string,
      clusterId?: string,
      setAlias?: boolean,
      setEnvVar?: boolean,
    ): Chainable<Cypress.Exec>;
    newByDataTestId(selector: string, timeout?: number): Chainable<JQuery<>>;
    hostDetailSelector(i: number, label: string, timeout?: number): Chainable<Element>;
    getClusterNameLinkSelector(clusterName?: string): Chainable<Element>;
    getIndexByName(selector: string, name: string, timeout?: number): Chainable<Element>;
    loadAiAPIIntercepts(conf: AIInterceptsConfig | null);
  }
}
