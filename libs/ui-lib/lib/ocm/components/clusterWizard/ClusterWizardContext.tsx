import React from 'react';
import { HostsNetworkConfigurationType } from '../../services';
import { StaticIpView } from '../clusterConfiguration/staticIp/data/dataTypes';
import { ClusterWizardStepsType } from './wizardTransition';
import { UISettingsValues } from '../../../common';
import { InfraEnv } from '@openshift-assisted/types/assisted-installer-service';

export type ClusterWizardContextType = {
  currentStepId: ClusterWizardStepsType;
  setCurrentStepId(stepId: ClusterWizardStepsType): void;
  moveBack: () => void;
  moveNext: () => void;
  wizardStepIds: ClusterWizardStepsType[];
  onUpdateStaticIpView(view: StaticIpView): void;
  onUpdateHostNetworkConfigType(type: HostsNetworkConfigurationType): void;
  setCustomManifestsStep(addCustomManifest: boolean): void;
  customManifestsStep: boolean;
  wizardPerPage: number;
  setWizardPerPage: (perPage: number) => void;
  updateUISettings: (data: UISettingsValues) => Promise<void>;
  uiSettings?: UISettingsValues;
  installDisconnected: boolean;
  setInstallDisconnected: (enabled: boolean) => void;
  disconnectedInfraEnv?: InfraEnv;
  setDisconnectedInfraEnv: (infraEnv: InfraEnv | undefined) => void;
  /** Last pull secret submitted in disconnected Optional configurations (restored when going back from Review) */
  disconnectedFormPullSecret?: string;
  setDisconnectedFormPullSecret: (value: string | undefined) => void;
};

export const ClusterWizardContext = React.createContext<ClusterWizardContextType | null>(null);

export const useClusterWizardContext = () => {
  const context = React.useContext(ClusterWizardContext);
  if (!context) {
    throw new Error('useClusterWizardContext must be used within ClusterWizardContextProvider');
  }
  return context;
};
