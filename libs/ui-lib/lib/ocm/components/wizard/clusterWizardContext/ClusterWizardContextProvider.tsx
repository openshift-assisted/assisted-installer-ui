import React, { PropsWithChildren } from 'react';
import { useLocation } from 'react-router';
import { AlertVariant } from '@patternfly/react-core';
import { Cluster, InfraEnv } from '@openshift-assisted/types/assisted-installer-service';

import { useAlerts, isThirdPartyCNI } from '../../../../common';
import {
  AssistedInstallerOCMPermissionTypesListType,
  useFeature,
  useUISettings,
} from '../../../hooks';
import useSetClusterPermissions from '../../../hooks/useSetClusterPermissions';
import { HostsNetworkConfigurationType } from '../../../services';
import { isOciPlatformType } from '../../utils';
import { StaticIpView } from '../steps/staticIp/data/dataTypes';
import { getStaticIpInfo } from '../steps/staticIp/data/fromInfraEnv';
import {
  ClusterWizardStepsType,
  ClusterWizardFlowStateType,
  disconnectedSteps,
  getClusterWizardFirstStep,
  isStepAfter,
  isStaticIpStep,
} from '../utils';
import { ClusterWizardContextType, ClusterWizardContext } from './ClusterWizardContext';
import { getDisconnectedWizardStepIds, getWizardStepIds } from './utils';

export const ClusterWizardContextProvider = ({
  children,
  cluster,
  infraEnv,
  permissions,
}: PropsWithChildren<{
  cluster?: Cluster;
  infraEnv?: InfraEnv;
  permissions?: AssistedInstallerOCMPermissionTypesListType;
}>) => {
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const [currentStepId, setCurrentStepId] = React.useState<ClusterWizardStepsType>();
  const [connectedWizardStepIds, setWizardStepIds] = React.useState<ClusterWizardStepsType[]>();
  const [wizardPerPage, setWizardPerPage] = React.useState(10);
  const [installDisconnected, setInstallDisconnected] = React.useState(false);
  const [disconnectedCluster, setDisconnectedCluster] = React.useState<Cluster | undefined>();
  const [disconnectedInfraEnv, setDisconnectedInfraEnv] = React.useState<InfraEnv | undefined>();
  const [disconnectedWizardStepIds, setDisconnectedWizardStepIds] =
    React.useState<ClusterWizardStepsType[]>(disconnectedSteps);
  const location = useLocation();
  const locationState = location.state as ClusterWizardFlowStateType | undefined;
  const {
    uiSettings,
    updateUISettings,
    loading: UISettingsLoading,
    error: UISettingsError,
  } = useUISettings(cluster?.id);
  const { clearAlerts, addAlert, alerts } = useAlerts();
  const setClusterPermissions = useSetClusterPermissions();

  const wizardStepIds = installDisconnected ? disconnectedWizardStepIds : connectedWizardStepIds;

  React.useEffect(() => {
    if (!UISettingsLoading) {
      const staticIpInfo = infraEnv ? getStaticIpInfo(infraEnv) : undefined;
      let customManifestsRequired = false;
      if (cluster) {
        customManifestsRequired =
          isThirdPartyCNI(cluster.networkType) || isOciPlatformType(cluster);
      }
      const customManifestsStepNeedsToBeFilled =
        customManifestsRequired && !uiSettings?.customManifestsAdded;

      const requiredStepId = getClusterWizardFirstStep(
        locationState,
        staticIpInfo,
        cluster?.status,
        cluster,
      );
      const firstStepIds = getWizardStepIds(
        wizardStepIds,
        staticIpInfo?.view,
        isSingleClusterFeatureEnabled,
      );

      // Only move step if there is still none, or the user is at a forbidden step
      if (
        !currentStepId ||
        (customManifestsStepNeedsToBeFilled && isStepAfter(currentStepId, requiredStepId))
      ) {
        setCurrentStepId(requiredStepId);
      }

      setWizardStepIds(firstStepIds);
      setClusterPermissions(cluster, permissions);
    }

    if (
      !!UISettingsError &&
      !alerts.some((alert) => alert.title === "Couldn't retrieve UI settings")
    ) {
      addAlert({
        title: "Couldn't retrieve UI settings",
        message: UISettingsError,
        variant: AlertVariant.warning,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiSettings, UISettingsLoading, UISettingsError, isSingleClusterFeatureEnabled]);

  const contextValue = React.useMemo<ClusterWizardContextType | null>(() => {
    if (!wizardStepIds || !currentStepId) {
      return null;
    }

    const handleMoveFromStaticIp = () => {
      //if static ip view change wasn't persisted, moving from static ip step should change the wizard steps to match the view in the infra env
      if (installDisconnected) {
        const staticIpInfo = disconnectedInfraEnv
          ? getStaticIpInfo(disconnectedInfraEnv)
          : undefined;
        if (!staticIpInfo) {
          throw `Wizard step is currently ${currentStepId}, but no static ip info is defined`;
        }
        setDisconnectedWizardStepIds(getDisconnectedWizardStepIds(staticIpInfo.view));
      } else {
        const staticIpInfo = infraEnv ? getStaticIpInfo(infraEnv) : undefined;
        if (!staticIpInfo) {
          throw `Wizard step is currently ${currentStepId}, but no static ip info is defined`;
        }
        const newStepIds = getWizardStepIds(
          wizardStepIds,
          staticIpInfo.view,
          isSingleClusterFeatureEnabled,
        );
        setWizardStepIds(newStepIds);
      }
    };

    const onSetCurrentStepId = (stepId: ClusterWizardStepsType) => {
      clearAlerts();
      if (isStaticIpStep(currentStepId) && !isStaticIpStep(stepId)) {
        handleMoveFromStaticIp();
      }
      setCurrentStepId(stepId);
    };

    return {
      moveBack(): void {
        clearAlerts();
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
        if (view === StaticIpView.YAML) {
          setCurrentStepId('static-ip-yaml-view');
        } else {
          setCurrentStepId('static-ip-network-wide-configurations');
        }
        if (installDisconnected) {
          setDisconnectedWizardStepIds(getDisconnectedWizardStepIds(view));
        } else {
          setWizardStepIds(getWizardStepIds(wizardStepIds, view, isSingleClusterFeatureEnabled));
        }
      },
      onUpdateHostNetworkConfigType(type: HostsNetworkConfigurationType): void {
        if (installDisconnected) {
          if (type === HostsNetworkConfigurationType.STATIC) {
            const staticIpInfo = disconnectedInfraEnv
              ? getStaticIpInfo(disconnectedInfraEnv)
              : undefined;
            const view = staticIpInfo?.view ?? StaticIpView.FORM;
            setDisconnectedWizardStepIds(getDisconnectedWizardStepIds(view));
          } else {
            setDisconnectedWizardStepIds(getDisconnectedWizardStepIds('dhcp-selected'));
          }
        } else {
          if (type === HostsNetworkConfigurationType.STATIC) {
            const staticIpInfo = infraEnv ? getStaticIpInfo(infraEnv) : undefined;
            const view = staticIpInfo?.view ?? StaticIpView.FORM;
            setWizardStepIds(getWizardStepIds(wizardStepIds, view, isSingleClusterFeatureEnabled));
          } else {
            setWizardStepIds(
              getWizardStepIds(wizardStepIds, 'dhcp-selected', isSingleClusterFeatureEnabled),
            );
          }
        }
      },
      wizardStepIds: wizardStepIds,
      currentStepId,
      setCurrentStepId: onSetCurrentStepId,
      wizardPerPage,
      setWizardPerPage,
      uiSettings,
      updateUISettings,
      installDisconnected,
      setInstallDisconnected: (enabled: boolean) => {
        setInstallDisconnected(enabled);
        if (enabled) {
          setDisconnectedWizardStepIds(disconnectedSteps);
          onSetCurrentStepId(disconnectedSteps[0]);
        } else {
          connectedWizardStepIds?.length && onSetCurrentStepId(connectedWizardStepIds[0]);
        }
      },
      disconnectedCluster,
      setDisconnectedCluster,
      disconnectedInfraEnv,
      setDisconnectedInfraEnv,
    };
  }, [
    wizardStepIds,
    currentStepId,
    infraEnv,
    wizardPerPage,
    isSingleClusterFeatureEnabled,
    clearAlerts,
    uiSettings,
    updateUISettings,
    installDisconnected,
    connectedWizardStepIds,
    disconnectedCluster,
    disconnectedInfraEnv,
    setDisconnectedInfraEnv,
  ]);

  if (!contextValue) {
    return null;
  }

  return (
    <>
      <ClusterWizardContext.Provider value={contextValue}>{children}</ClusterWizardContext.Provider>
    </>
  );
};
