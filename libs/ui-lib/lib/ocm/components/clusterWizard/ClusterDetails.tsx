import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import { useDispatch } from 'react-redux';
import { useAlerts, LoadingState, ClusterWizardStep, ErrorState } from '../../../common';
import { usePullSecret } from '../../hooks';
import { getApiErrorMessage, handleApiError, isUnknownServerError } from '../../../common/api';
import { setServerUpdateError, updateCluster } from '../../store/slices/current-cluster/slice';
import { useClusterWizardContext } from './ClusterWizardContext';
import { canNextClusterDetails, ClusterWizardFlowStateNew } from './wizardTransition';
import { useManagedDomains, useUsedClusterNames } from '../../hooks';
import { useOpenshiftVersionsContext } from './OpenshiftVersionsContext';
import ClusterDetailsForm from './ClusterDetailsForm';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import {
  ClusterDetailsUpdateParams,
  ClustersService,
  ClusterCreateParamsWithStaticNetworking,
  UISettingService,
} from '../../services';
import { Cluster, InfraEnv } from '@openshift-assisted/types/assisted-installer-service';

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
  const pullSecret = usePullSecret();
  const {
    error: errorOCPVersions,
    loading: loadingOCPVersions,
    latestVersions: versions,
  } = useOpenshiftVersionsContext();
  const location = useLocation();

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
        const cluster = await ClustersService.create(params, isAssistedMigration);
        navigate(`../${cluster.id}`, { state: ClusterWizardFlowStateNew });
        await UISettingService.update(cluster.id, { addCustomManifests });
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to create new cluster', message: getApiErrorMessage(e) }),
        );
        if (isUnknownServerError(e as Error)) {
          dispatch(setServerUpdateError());
        }
      }
    },
    [clearAlerts, location.search, navigate, addAlert, dispatch],
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
        <ErrorState title="Failed to retrieve OpenShift versions" />
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
      moveNext={() => clusterWizardContext.moveNext()}
      handleClusterUpdate={handleClusterUpdate}
      handleClusterCreate={handleClusterCreate}
      navigation={navigation}
      infraEnv={infraEnv}
    />
  );
};

export default ClusterDetails;
