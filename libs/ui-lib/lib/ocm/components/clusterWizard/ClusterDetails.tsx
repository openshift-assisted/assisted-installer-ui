import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import { useDispatch } from 'react-redux';
import {
  useAlerts,
  LoadingState,
  ClusterWizardStep,
  ErrorState,
  UISettingsValues,
} from '../../../common';
import { usePullSecret } from '../../hooks';
import { getApiErrorMessage, handleApiError, isUnknownServerError } from '../../../common/api';
import { setServerUpdateError, updateCluster } from '../../store/slices/current-cluster/slice';
import { useClusterWizardContext } from './ClusterWizardContext';
import { canNextClusterDetails, ClusterWizardFlowStateNew } from './wizardTransition';
import { useManagedDomains, useUsedClusterNames } from '../../hooks';
import { useOpenShiftVersionsContext } from './OpenShiftVersionsContext';
import ClusterDetailsForm from './ClusterDetailsForm';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import {
  ClusterDetailsUpdateParams,
  ClustersService,
  ClusterCreateParamsWithStaticNetworking,
  UISettingService,
} from '../../services';
import { Cluster, InfraEnv } from '@openshift-assisted/types/assisted-installer-service';
import BundleService from '../../services/BundleService';
import { useFeature } from '../../hooks/use-feature';

type ClusterDetailsProps = {
  cluster?: Cluster;
  infraEnv?: InfraEnv;
};

const ClusterDetails = ({ cluster, infraEnv }: ClusterDetailsProps) => {
  const clusterWizardContext = useClusterWizardContext();
  const managedDomains = useManagedDomains();
  const { addAlert, clearAlerts } = useAlerts();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { usedClusterNames } = useUsedClusterNames(cluster?.id || '');
  const {
    error: errorOCPVersions,
    loading: loadingOCPVersions,
    latestVersions: versions,
  } = useOpenShiftVersionsContext();
  const location = useLocation();
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const defaultPullSecret = usePullSecret();
  const pullSecret = isSingleClusterFeatureEnabled ? infraEnv?.pullSecret || '' : defaultPullSecret;

  const handleClusterUpdate = React.useCallback(
    async (
      clusterId: Cluster['id'],
      params: ClusterDetailsUpdateParams,
      addCustomManifests: boolean,
    ) => {
      clearAlerts();

      try {
        const { data: updatedCluster } = await ClustersService.update(
          clusterId,
          cluster?.tags,
          params,
        );
        await clusterWizardContext.updateUISettings({ addCustomManifests });
        dispatch(updateCluster(updatedCluster));

        canNextClusterDetails({ cluster: updatedCluster }) && clusterWizardContext.moveNext();
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to update the cluster', message: getApiErrorMessage(e) }),
        );
        if (isUnknownServerError(e as Error)) {
          dispatch(setServerUpdateError());
        }
      }
    },
    [clearAlerts, addAlert, dispatch, cluster?.tags, clusterWizardContext],
  );

  const handleClusterCreate = React.useCallback(
    async (params: ClusterCreateParamsWithStaticNetworking, addCustomManifests: boolean) => {
      clearAlerts();
      try {
        const searchParams = new URLSearchParams(location.search);
        const isAssistedMigration = searchParams.get('source') === 'assisted_migration';
        //For Assisted Migration we need the LVMs operator and also the virtualization bundle operators
        if (isAssistedMigration) {
          params.olmOperators = [{ name: 'lvm' }];
          const selectedBundle = (
            await BundleService.listBundles(
              params.openshiftVersion,
              params.cpuArchitecture,
              params.platform?.type,
            )
          ).find((b) => b.id === 'virtualization');
          const virtOperators = selectedBundle?.operators;
          params.olmOperators = [
            ...params.olmOperators,
            ...(virtOperators ? virtOperators.map((op) => ({ name: op })) : []),
          ];
        }
        const cluster = await ClustersService.create(
          params,
          isAssistedMigration,
          isSingleClusterFeatureEnabled,
        );
        navigate(`../${cluster.id}`, { state: ClusterWizardFlowStateNew });

        const uiPatch: UISettingsValues = { addCustomManifests };
        if (isAssistedMigration) {
          //For Assisted Migration we need to enable virtualization bundle
          uiPatch.bundlesSelected = ['virtualization'];
          uiPatch.isAssistedMigration = true;
        }
        await UISettingService.update(cluster.id, uiPatch);
        await clusterWizardContext.updateUISettings(uiPatch); // keeps local state current
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to create new cluster', message: getApiErrorMessage(e) }),
        );
        if (isUnknownServerError(e as Error)) {
          dispatch(setServerUpdateError());
        }
      }
    },
    [
      clearAlerts,
      location.search,
      isSingleClusterFeatureEnabled,
      navigate,
      clusterWizardContext,
      addAlert,
      dispatch,
    ],
  );

  const navigation = <ClusterWizardNavigation cluster={cluster} />;
  if (pullSecret === undefined || !managedDomains || loadingOCPVersions || !usedClusterNames) {
    return (
      <ClusterWizardStep navigation={navigation}>
        <LoadingState />
      </ClusterWizardStep>
    );
  }

  if (!cluster && errorOCPVersions) {
    return (
      <ClusterWizardStep navigation={navigation}>
        <ErrorState
          title={errorOCPVersions.title || 'Failed to retrieve OpenShift versions'}
          content={errorOCPVersions.message || 'No OpenShift versions available.'}
        />
      </ClusterWizardStep>
    );
  }

  return (
    <ClusterDetailsForm
      cluster={cluster}
      pullSecret={pullSecret}
      managedDomains={managedDomains}
      ocpVersions={versions}
      usedClusterNames={usedClusterNames}
      handleClusterUpdate={handleClusterUpdate}
      handleClusterCreate={handleClusterCreate}
      navigation={navigation}
      infraEnv={infraEnv}
    />
  );
};

export default ClusterDetails;
