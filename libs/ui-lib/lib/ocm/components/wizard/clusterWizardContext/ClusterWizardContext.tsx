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
  /** UI-only: network config type selected in disconnected optional configurations step. */
  disconnectedHostsNetworkConfigurationType?: 'dhcp' | 'static';
  setDisconnectedHostsNetworkConfigurationType: (value: 'dhcp' | 'static') => void;
};

export const ClusterWizardContext = React.createContext<ClusterWizardContextType | null>(null);

export const useClusterWizardContext = () => {
  const context = React.useContext(ClusterWizardContext);
  if (!context) {
    throw new Error('useClusterWizardContext must be used within ClusterWizardContextProvider');
  }
  return context;
};
