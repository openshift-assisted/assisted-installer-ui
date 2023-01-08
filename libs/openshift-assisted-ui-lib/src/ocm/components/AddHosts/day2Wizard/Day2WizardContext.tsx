import React from 'react';
import { HostsNetworkConfigurationType } from '../../../services';
import { StaticIpView } from '../../clusterConfiguration/staticIp/data/dataTypes';
import { Day2WizardStepsType } from './constants';
import { CpuArchitecture } from '../../../../common';

export type Day2WizardContextType = {
  currentStepId: Day2WizardStepsType;
  setCurrentStepId(stepId: Day2WizardStepsType): void;
  selectedIsoUrl: string;
  setSelectedIsoUrl: (isoUrl: string) => void;
  selectedCpuArchitecture: CpuArchitecture;
  setSelectedCpuArchitecture(cpuArchitecture: CpuArchitecture): void;
  moveBack(): void;
  moveNext(): void;
  onUpdateStaticIpView(view: StaticIpView): void;
  onUpdateHostNetworkConfigType(type: HostsNetworkConfigurationType): void;
  wizardStepIds: Day2WizardStepsType[];
  selectedIpxeUrl: string;
  setSelectedIpxeUrl: (ipxeUrl: string) => void;
};

const Day2WizardContext = React.createContext<Day2WizardContextType | null>(null);

export const useDay2WizardContext = () => {
  const context = React.useContext(Day2WizardContext);
  if (!context) {
    throw new Error('useDay2WizardContext must be used within Day2WizardContextProvider');
  }
  return context;
};

export default Day2WizardContext;
