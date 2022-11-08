import React, { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import isEqual from 'lodash/isEqual';
import ClusterWizardContext, { ClusterWizardContextType } from './ClusterWizardContext';
import {
  ClusterWizardFlowStateType,
  ClusterWizardStepsType,
  getClusterWizardFirstStep,
  isStaticIpStep,
} from './wizardTransition';
import { HostsNetworkConfigurationType } from '../../services';
import { defaultWizardSteps, staticIpFormViewSubSteps } from './constants';
import { StaticIpView } from '../clusterConfiguration/staticIp/data/dataTypes';
import { getStaticIpInfo } from '../clusterConfiguration/staticIp/data/fromInfraEnv';
import { Cluster, InfraEnv, AssistedInstallerOCMPermissionTypesListType } from '../../../common';
import useSetClusterPermissions from '../../hooks/useSetClusterPermissions';

const getWizardStepIds = (staticIpView?: StaticIpView): ClusterWizardStepsType[] => {
  const stepIds: ClusterWizardStepsType[] = [...defaultWizardSteps];
  if (staticIpView === StaticIpView.YAML) {
    stepIds.splice(1, 0, 'static-ip-yaml-view');
  } else if (staticIpView === StaticIpView.FORM) {
    stepIds.splice(1, 0, ...staticIpFormViewSubSteps);
  }
  return stepIds;
};

const ClusterWizardContextProvider: React.FC<
  PropsWithChildren<{
    cluster?: Cluster;
    infraEnv?: InfraEnv;
    permissions?: AssistedInstallerOCMPermissionTypesListType;
  }>
> = ({ children, cluster, infraEnv, permissions }) => {
  const [currentStepId, setCurrentStepId] = React.useState<ClusterWizardStepsType>();
  const [wizardStepIds, setWizardStepIds] = React.useState<ClusterWizardStepsType[]>();
  const { state: locationState } = useLocation<ClusterWizardFlowStateType>();
  const setClusterPermissions = useSetClusterPermissions();

  React.useEffect(() => {
    const staticIpInfo = infraEnv ? getStaticIpInfo(infraEnv) : undefined;
    const firstStep = getClusterWizardFirstStep(
      locationState,
      staticIpInfo,
      cluster?.status,
      cluster?.hosts,
    );
    const firstStepIds = getWizardStepIds(staticIpInfo?.view);
    setCurrentStepId(firstStep);
    setWizardStepIds(firstStepIds);
    setClusterPermissions(cluster, permissions);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const contextValue = React.useMemo<ClusterWizardContextType | null>(() => {
    if (!wizardStepIds || !currentStepId) {
      return null;
    }

    const handleMoveFromStaticIp = () => {
      //if static ip view change wasn't persisted, moving from static ip step should change the wizard steps to match the view in the infra env
      const staticIpInfo = infraEnv ? getStaticIpInfo(infraEnv) : undefined;
      if (!staticIpInfo) {
        throw `Wizard step is currently ${currentStepId}, but no static ip info is defined`;
      }
      const newStepIds = getWizardStepIds(staticIpInfo.view);
      if (!isEqual(newStepIds, wizardStepIds)) {
        setWizardStepIds(newStepIds);
      }
    };

    const onSetCurrentStepId = (stepId: ClusterWizardStepsType) => {
      if (isStaticIpStep(currentStepId) && !isStaticIpStep(stepId)) {
        handleMoveFromStaticIp();
      }
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
      onUpdateStaticIpView(view: StaticIpView): void {
        setWizardStepIds(getWizardStepIds(view));
        if (view === StaticIpView.YAML) {
          setCurrentStepId('static-ip-yaml-view');
        } else {
          setCurrentStepId('static-ip-network-wide-configurations');
        }
      },
      onUpdateHostNetworkConfigType(type: HostsNetworkConfigurationType): void {
        if (type === HostsNetworkConfigurationType.STATIC) {
          setWizardStepIds(getWizardStepIds(StaticIpView.FORM));
        } else {
          setWizardStepIds(getWizardStepIds());
        }
      },
      wizardStepIds,
      currentStepId,
      setCurrentStepId: onSetCurrentStepId,
    };
  }, [wizardStepIds, currentStepId, infraEnv]);
  if (!contextValue) {
    return null;
  }
  return (
    <>
      <ClusterWizardContext.Provider value={contextValue}>{children}</ClusterWizardContext.Provider>
    </>
  );
};

export default ClusterWizardContextProvider;
