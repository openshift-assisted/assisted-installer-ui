/**
 * The signal order determinesa sequence of events.
 * When a signal is given, it is implied that the previous steps
 * have already taken place
 */
const signalOrder = [
  // For general cluster creation flow
  'CLUSTER_CREATED',
  // Static IP configuration
  'STATIC_IP_ENABLED',
  'STATIC_IP_NETWORK_WIDE_CONFIGURED',
  'STATIC_IP_HOST_SPECIFIC_CONFIGURED',

  // General cluster creation flow (continued)
  'ISO_DOWNLOADED',
  'HOST_DISCOVERED_1',
  'HOST_RENAMED_1',
  'HOST_DISCOVERED_2',
  'HOST_RENAMED_2',
  'HOST_DISCOVERED_3',
  'HOST_RENAMED_3',

  // Networking signals
  // - Dual Stack
  'NETWORKING_DUAL_STACK_DISCOVERED',
  'NETWORKING_DUAL_STACK_SELECT_SINGLE_STACK',
  'NETWORKING_DUAL_STACK_SELECT_DUAL_STACK',

  // Last signal must always be Ready to install
  'READY_TO_INSTALL',
];

export type SignalName = typeof signalOrder[number];

export const setLastWizardSignal = (signalName: SignalName) => {
  Cypress.env('AI_LAST_SIGNAL', signalName);
};

export const hasWizardSignal = (signalName: SignalName) => {
  const currentSignalOrder = signalOrder.findIndex((signal) => signal === Cypress.env('AI_LAST_SIGNAL'));

  const reqSignalOrder = signalOrder.findIndex((signal) => signal === signalName);
  return reqSignalOrder !== -1 && reqSignalOrder <= currentSignalOrder;
};

export const getUiVersion = () => {
  return new Cypress.Promise((resolve) => {
    if (Cypress.env('AI_MOCKED_UI_VERSION')) {
      resolve(Cypress.env('AI_MOCKED_UI_VERSION'));
    } else {
      cy.newByDataTestId('assisted-ui-lib-version')
        .invoke('text')
        .then((uiVersion) => {
          resolve(uiVersion);
        });
    }
  });
};

export const getCwd = () => {
  return new Cypress.Promise((resolve) => {
    cy.exec('echo $HOME').then((homeDir) => {
      resolve(homeDir.stdout);
    });
  });
};

export const hostDetailSelector = (row: number, label: string) =>
  // NOTE: The first row is number 2! Shift your indexes...
  `table.hosts-table > tbody:nth-child(${row}) > tr:nth-child(1) > [data-label="${label}"]`;
