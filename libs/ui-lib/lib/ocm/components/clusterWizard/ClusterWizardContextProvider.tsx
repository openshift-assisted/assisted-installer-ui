import React, { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom-v5-compat';
import { ClusterWizardContextType, ClusterWizardContext } from './ClusterWizardContext';
import {
  ClusterWizardFlowStateType,
  ClusterWizardStepsType,
  getClusterWizardFirstStep,
  isStaticIpStep,
  isStepAfter,
} from './wizardTransition';
import { HostsNetworkConfigurationType } from '../../services';
import { defaultWizardSteps, staticIpFormViewSubSteps } from './constants';
import { StaticIpView } from '../clusterConfiguration/staticIp/data/dataTypes';
import { getStaticIpInfo } from '../clusterConfiguration/staticIp/data/fromInfraEnv';
import { AssistedInstallerOCMPermissionTypesListType, useAlerts } from '../../../common';
import useSetClusterPermissions from '../../hooks/useSetClusterPermissions';
import { Cluster, InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import { useUISettings } from '../../hooks';
import { AlertVariant } from '@patternfly/react-core';
import { useFeature } from '../../hooks/use-feature';

const addStepToClusterWizard = (
  wizardStepIds: ClusterWizardStepsType[],
  addAfterStep: ClusterWizardStepsType,
  itemsToAdd: ClusterWizardStepsType[],
) => {
  const stepsIds = [...wizardStepIds];
  const referencePosition = stepsIds.findIndex((step) => step === addAfterStep);
  const found = wizardStepIds.filter((step) => step === itemsToAdd[0]);
  if (referencePosition !== -1 && found.length === 0) {
    stepsIds.splice(referencePosition + 1, 0, ...itemsToAdd);
  }
  return stepsIds;
};

const removeStepFromClusterWizard = (
  wizardStepIds: ClusterWizardStepsType[],
  itemToRemove: ClusterWizardStepsType,
  numberItemsToRemove: number,
) => {
  const stepsIds = [...wizardStepIds];
  const position = stepsIds.findIndex((step) => step === itemToRemove);
  if (position !== -1) {
    stepsIds.splice(position, numberItemsToRemove);
  }
  return stepsIds;
};

const getWizardStepIds = (
  wizardStepIds: ClusterWizardStepsType[] | undefined,
  staticIpView?: StaticIpView | 'dhcp-selected',
  customManifestsStep?: boolean,
  isSingleClusterFeatureEnabled?: boolean,
): ClusterWizardStepsType[] => {
  let stepsCopy = wizardStepIds ? [...wizardStepIds] : [...defaultWizardSteps];
  if (staticIpView === StaticIpView.YAML) {
    stepsCopy = removeStepFromClusterWizard(stepsCopy, 'static-ip-network-wide-configurations', 2);
    stepsCopy = addStepToClusterWizard(stepsCopy, 'cluster-details', ['static-ip-yaml-view']);
  } else if (staticIpView === StaticIpView.FORM) {
    stepsCopy = removeStepFromClusterWizard(stepsCopy, 'static-ip-yaml-view', 1);
    stepsCopy = addStepToClusterWizard(stepsCopy, 'cluster-details', staticIpFormViewSubSteps);
  } else if (staticIpView === 'dhcp-selected') {
    stepsCopy = removeStepFromClusterWizard(stepsCopy, 'static-ip-network-wide-configurations', 2);
  }

  if (customManifestsStep) {
    stepsCopy = addStepToClusterWizard(stepsCopy, 'networking', ['custom-manifests']);
  } else {
    stepsCopy = removeStepFromClusterWizard(stepsCopy, 'custom-manifests', 1);
  }
  if (isSingleClusterFeatureEnabled) {
    // tentatively removed, proper waiting on support by backend
    stepsCopy = removeStepFromClusterWizard(stepsCopy, 'operators', 1);
  }

  return stepsCopy;
};

const ClusterWizardContextProvider = ({
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
  const [wizardStepIds, setWizardStepIds] = React.useState<ClusterWizardStepsType[]>();
  const [wizardPerPage, setWizardPerPage] = React.useState(10);
  const [customManifestsStep, setCustomManifestsStep] = React.useState<boolean>(false);
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

  React.useEffect(() => {
    if (!UISettingsLoading) {
      const staticIpInfo = infraEnv ? getStaticIpInfo(infraEnv) : undefined;
      const customManifestsStepEnabled = !!uiSettings?.addCustomManifests;
      const customManifestsStepNeedsToBeFilled = !!(
        uiSettings?.addCustomManifests && !uiSettings?.customManifestsAdded
      );

      const requiredStepId = getClusterWizardFirstStep(
        locationState,
        staticIpInfo,
        cluster?.status,
        cluster?.hosts,
        isSingleClusterFeatureEnabled,
        customManifestsStepNeedsToBeFilled,
      );

      const firstStepIds = getWizardStepIds(
        wizardStepIds,
        staticIpInfo?.view,
        customManifestsStepEnabled,
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
      setCustomManifestsStep(!!uiSettings?.addCustomManifests);
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
  }, [uiSettings, UISettingsLoading, UISettingsError]);

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
      const newStepIds = getWizardStepIds(
        wizardStepIds,
        staticIpInfo.view,
        customManifestsStep,
        isSingleClusterFeatureEnabled,
      );
      setWizardStepIds(newStepIds);
    };

    const onSetCurrentStepId = (stepId: ClusterWizardStepsType) => {
      if (isStaticIpStep(currentStepId) && !isStaticIpStep(stepId)) {
        handleMoveFromStaticIp();
      }
      setCurrentStepId(stepId);
    };

    const onSetAddCustomManifestsStep = (addCustomManifest: boolean) => {
      setCustomManifestsStep(addCustomManifest);
      setWizardStepIds(
        getWizardStepIds(
          wizardStepIds,
          undefined,
          addCustomManifest,
          isSingleClusterFeatureEnabled,
        ),
      );
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
        setWizardStepIds(
          getWizardStepIds(wizardStepIds, view, customManifestsStep, isSingleClusterFeatureEnabled),
        );
      },
      onUpdateHostNetworkConfigType(type: HostsNetworkConfigurationType): void {
        if (type === HostsNetworkConfigurationType.STATIC) {
          setWizardStepIds(
            getWizardStepIds(
              wizardStepIds,
              StaticIpView.FORM,
              customManifestsStep,
              isSingleClusterFeatureEnabled,
            ),
          );
        } else {
          setWizardStepIds(
            getWizardStepIds(
              wizardStepIds,
              'dhcp-selected',
              customManifestsStep,
              isSingleClusterFeatureEnabled,
            ),
          );
        }
      },
      wizardStepIds,
      currentStepId,
      setCurrentStepId: onSetCurrentStepId,
      customManifestsStep,
      setCustomManifestsStep: onSetAddCustomManifestsStep,
      wizardPerPage,
      setWizardPerPage,
      uiSettings,
      updateUISettings,
    };
  }, [
    wizardStepIds,
    currentStepId,
    infraEnv,
    customManifestsStep,
    wizardPerPage,
    isSingleClusterFeatureEnabled,
    clearAlerts,
    uiSettings,
    updateUISettings,
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

export default ClusterWizardContextProvider;
