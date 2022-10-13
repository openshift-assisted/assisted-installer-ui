import React, { PropsWithChildren } from 'react';
import Day2WizardContext, { Day2WizardContextType } from './Day2WizardContext';
import { AssistedInstallerOCMPermissionTypesListType, Cluster, InfraEnv } from '../../../../common';
import useSetClusterPermissions from '../../../hooks/useSetClusterPermissions';
import { Day2WizardStepsType, defaultWizardSteps } from './constants';

const getWizardStepIds = (): Day2WizardStepsType[] => {
  const stepIds: Day2WizardStepsType[] = [...defaultWizardSteps];
  return stepIds;
};

const Day2WizardContextProvider = ({
  children,
  cluster,
  permissions,
}: PropsWithChildren<{
  cluster?: Cluster;
  infraEnv?: InfraEnv;
  permissions?: AssistedInstallerOCMPermissionTypesListType;
}>) => {
  const [currentStepId, setCurrentStepId] = React.useState<Day2WizardStepsType>('cluster-details');
  const [wizardStepIds, setWizardStepIds] = React.useState<Day2WizardStepsType[]>();
  const setClusterPermissions = useSetClusterPermissions();

  React.useEffect(() => {
    const firstStepIds = getWizardStepIds();
    setWizardStepIds(firstStepIds);
    setClusterPermissions(cluster, permissions);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue = React.useMemo<Day2WizardContextType | null>(() => {
    if (!wizardStepIds || !currentStepId) {
      return null;
    }

    const onSetCurrentStepId = (stepId: Day2WizardStepsType) => {
      setCurrentStepId(stepId);
    };

    return {
      moveBack(): void {
        const currentStepIdx = wizardStepIds.indexOf(currentStepId);
        let nextStepId = wizardStepIds[currentStepIdx - 1];
        if (nextStepId === 'static-ip-host-configurations') {
          //when moving back to static ip form view, it should go to network wide configurations
          nextStepId = 'static-ip-network-wide-configurations';
        }
        onSetCurrentStepId(nextStepId);
      },
      moveNext(): void {
        const currentStepIdx = wizardStepIds.indexOf(currentStepId);
        onSetCurrentStepId(wizardStepIds[currentStepIdx + 1]);
      },
      wizardStepIds,
      currentStepId,
      setCurrentStepId: onSetCurrentStepId,
    };
  }, [wizardStepIds, currentStepId]);

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
