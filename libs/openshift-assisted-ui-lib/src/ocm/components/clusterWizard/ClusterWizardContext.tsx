import React from 'react';
import { HostsNetworkConfigurationType } from '../../services';
import { StaticIpView } from '../clusterConfiguration/staticIp/data/dataTypes';
import { ClusterWizardStepsType } from './wizardTransition';

export type ClusterWizardContextType = {
  currentStepId: ClusterWizardStepsType;
  setCurrentStepId(stepId: ClusterWizardStepsType): void;
  moveBack(): void;
  moveNext(): void;
  wizardStepIds: ClusterWizardStepsType[];
  onUpdateStaticIpView(view: StaticIpView): void;
  onUpdateHostNetworkConfigType(type: HostsNetworkConfigurationType): void;
};

const ClusterWizardContext = React.createContext<ClusterWizardContextType | null>(null);

export const useClusterWizardContext = () => {
  const context = React.useContext(ClusterWizardContext);
  if (!context) {
    throw new Error('useClusterWizardContext must be used within ClusterWizardContextProvider');
  }
  return context;
};

export default ClusterWizardContext;
