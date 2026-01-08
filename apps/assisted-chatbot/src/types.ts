import { StateManager } from '@redhat-cloud-services/ai-client-state';
import { IAIClient } from '@redhat-cloud-services/ai-client-common';

export enum Models {
  ASK_RED_HAT = 'Ask Red Hat',
  RHEL_LIGHTSPEED = 'RHEL LightSpeed',
  VA = 'Virtual Assistant',
  OAI = 'OpenShift assisted Installer',
}

export interface WelcomeButton {
  /** Title for the welcome button */
  title: string;
  /** Optional message to display below the title */
  message?: string;
  /** Message to send when the button is clicked */
  value: string;
}

export interface WelcomeConfig {
  /** Welcome message content to display */
  content?: string;
  /** Optional array of interactive buttons */
  buttons?: WelcomeButton[];
}

export type StateManagerConfiguration<S extends IAIClient> = {
  model: Models;
  historyManagement: boolean;
  streamMessages: boolean;
  modelName: string;
  docsUrl: string;
  selectionTitle: string;
  selectionDescription: string;
  stateManager: StateManager<Record<string, unknown>, S>;
  isPreview?: boolean;
  handleNewChat?: (toggleDrawer: (isOpen: boolean) => void) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MessageEntryComponent?: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FooterComponent?: React.ComponentType<any>;
  welcome?: WelcomeConfig;
  routes?: string[];
};

export type UseManagerHook = {
  manager: StateManagerConfiguration<IAIClient> | null;
  loading: boolean;
};
