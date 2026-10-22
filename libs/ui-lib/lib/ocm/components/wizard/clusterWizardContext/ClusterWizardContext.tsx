import React from 'react';
import { Cluster, InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import { UISettingsValues } from '../../../../common';
import { HostsNetworkConfigurationType } from '../../../services';
import { ClusterWizardStepsType } from '../utils/wizardTransition';
import { StaticIpView } from '../steps/staticIp/data';

export type ClusterWizardContextType = {
  currentStepId: ClusterWizardStepsType;
  setCurrentStepId(stepId: ClusterWizardStepsType): void;
  moveBack: () => void;
  moveNext: () => void;
  wizardStepIds: ClusterWizardStepsType[];
  onUpdateStaticIpView(view: StaticIpView): void;
  onUpdateHostNetworkConfigType(type: HostsNetworkConfigurationType): void;
  wizardPerPage: number;
  setWizardPerPage: (perPage: number) => void;
  updateUISettings: (data: UISettingsValues) => Promise<void>;
  uiSettings?: UISettingsValues;
  installDisconnected: boolean;
  setInstallDisconnected: (enabled: boolean) => void;
  disconnectedCluster?: Cluster;
  setDisconnectedCluster: (cluster: Cluster | undefined) => void;
  disconnectedInfraEnv?: InfraEnv;
  setDisconnectedInfraEnv: (infraEnv: InfraEnv | undefined) => void;
};

export const ClusterWizardContext = React.createContext<ClusterWizardContextType | null>(null);

export const useClusterWizardContext = (): ClusterWizardContextType => {
  const context = React.useContext(ClusterWizardContext);
  if (!context) {
    throw new Error('useClusterWizardContext must be used within ClusterWizardContextProvider');
  }
  return context;
};

// Non-throwing variant for components (e.g. the static-IP form) that can render
// both inside the Day 1 wizard (provider present) and the Day 2 "Add Hosts" flow
// (no ClusterWizardContextProvider).
export const useClusterWizardContextOptional = (): ClusterWizardContextType | null =>
  React.useContext(ClusterWizardContext);

// `installDisconnected` is a Day 1-only concept; when the context is absent
// (Day 2 flow) it must default to false.
export const getInstallDisconnected = (context: ClusterWizardContextType | null): boolean =>
  context?.installDisconnected ?? false;
