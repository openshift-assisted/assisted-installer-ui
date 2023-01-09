import React, { PropsWithChildren } from 'react';
import Day2WizardContext, { Day2WizardContextType } from './Day2WizardContext';
import {
  AssistedInstallerOCMPermissionTypesListType,
  Cluster,
  CpuArchitecture,
  InfraEnv,
} from '../../../../common';
import { Day2WizardStepsType, defaultWizardSteps, staticIpFormViewSubSteps } from './constants';
import { HostsNetworkConfigurationType } from '../../../services';
import { StaticIpView } from '../../clusterConfiguration/staticIp/data/dataTypes';

const getWizardStepIds = (staticIpView?: string): Day2WizardStepsType[] => {
  const stepIds: Day2WizardStepsType[] = [...defaultWizardSteps];
  if (staticIpView === StaticIpView.YAML) {
    stepIds.splice(1, 0, 'static-ip-yaml-view');
  } else if (staticIpView === StaticIpView.FORM) {
    stepIds.splice(1, 0, ...staticIpFormViewSubSteps);
  }
  return stepIds;
};

const getNextStep = (wizardStepIds: Day2WizardStepsType[], currentStepId: Day2WizardStepsType) => {
  const currentStepIdx = wizardStepIds.indexOf(currentStepId);
  return wizardStepIds[currentStepIdx + 1];
};

const Day2WizardContextProvider = ({
  children,
}: PropsWithChildren<{
  cluster?: Cluster;
  infraEnv?: InfraEnv;
  permissions?: AssistedInstallerOCMPermissionTypesListType;
}>) => {
  const [currentStepId, setCurrentStepId] = React.useState<Day2WizardStepsType>('cluster-details');
  const [selectedCpuArchitecture, setSelectedCpuArchitecture] = React.useState<CpuArchitecture>(
    CpuArchitecture.x86,
  );
  const [selectedIsoUrl, setSelectedIsoUrl] = React.useState<string>('');
  const [selectedIpxeUrl, setSelectedIpxeUrl] = React.useState<string>('');
  const [wizardStepIds, setWizardStepIds] = React.useState<Day2WizardStepsType[]>(
    getWizardStepIds(),
  );

  const contextValue = React.useMemo<Day2WizardContextType | null>(() => {
    if (!wizardStepIds || !currentStepId) {
      return null;
    }

    return {
      moveBack(): void {
        const currentStepIdx = wizardStepIds.indexOf(currentStepId);
        let nextStepId = wizardStepIds[currentStepIdx - 1];
        if (nextStepId === 'static-ip-host-configurations') {
          //when moving back to static ip form view, it should go to network wide configurations
          nextStepId = 'static-ip-network-wide-configurations';
        }
        setCurrentStepId(nextStepId);
      },
      moveNext(): void {
        setCurrentStepId(getNextStep(wizardStepIds, currentStepId));
      },
      onUpdateStaticIpView(view: StaticIpView): void {
        setWizardStepIds(getWizardStepIds(view));
        if (view === StaticIpView.YAML) {
          setCurrentStepId('static-ip-yaml-view');
        } else {
          setCurrentStepId('static-ip-network-wide-configurations');
        }
      },
      onUpdateHostNetworkConfigType(type: HostsNetworkConfigurationType): void {
        let stepIds;
        if (type === HostsNetworkConfigurationType.STATIC) {
          stepIds = getWizardStepIds(StaticIpView.FORM);
        } else {
          stepIds = getWizardStepIds();
        }
        setWizardStepIds(stepIds);
        setCurrentStepId(getNextStep(stepIds, currentStepId));
      },

      wizardStepIds,
      currentStepId,
      setCurrentStepId,
      selectedIsoUrl,
      setSelectedIsoUrl,
      selectedCpuArchitecture,
      setSelectedCpuArchitecture,
      selectedIpxeUrl,
      setSelectedIpxeUrl,
    };
  }, [wizardStepIds, currentStepId, selectedIsoUrl, selectedCpuArchitecture, selectedIpxeUrl]);

  if (!contextValue) {
    return null;
  }

  return (
    <>
      <Day2WizardContext.Provider value={contextValue}>{children}</Day2WizardContext.Provider>
    </>
  );
};

export default Day2WizardContextProvider;
