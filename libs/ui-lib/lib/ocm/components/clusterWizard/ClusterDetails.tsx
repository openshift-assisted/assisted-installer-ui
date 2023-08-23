import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAlerts, LoadingState, ClusterWizardStep } from '../../../common';
import { usePullSecret } from '../../hooks';
import { getApiErrorMessage, handleApiError, isUnknownServerError } from '../../api';
import { setServerUpdateError, updateCluster } from '../../reducers/clusters';
import { useClusterWizardContext } from './ClusterWizardContext';
import { canNextClusterDetails, ClusterWizardFlowStateNew } from './wizardTransition';
import { useOpenshiftVersions, useManagedDomains, useUsedClusterNames } from '../../hooks';
import ClusterDetailsForm from './ClusterDetailsForm';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import { routeBasePath } from '../../config';
import {
  ClusterDetailsUpdateParams,
  ClustersService,
  ClusterCreateParamsWithStaticNetworking,
} from '../../services';
import useClusterCustomManifests from '../../hooks/useClusterCustomManifests';
import { Cluster, InfraEnv } from '@openshift-assisted/types/assisted-installer-service';

type ClusterDetailsProps = {
  cluster?: Cluster;
  infraEnv?: InfraEnv;
};

const ClusterDetails = ({ cluster, infraEnv }: ClusterDetailsProps) => {
  const clusterWizardContext = useClusterWizardContext();
  const managedDomains = useManagedDomains();
  const { addAlert, clearAlerts } = useAlerts();
  const history = useHistory();
  const dispatch = useDispatch();
  const { usedClusterNames } = useUsedClusterNames(cluster?.id || '');
  const pullSecret = usePullSecret();
  const { error: errorOCPVersions, loading: loadingOCPVersions, versions } = useOpenshiftVersions();
  const { customManifests } = useClusterCustomManifests(cluster?.id || '', false);
  React.useEffect(() => {
    errorOCPVersions && addAlert(errorOCPVersions);
  }, [errorOCPVersions, addAlert]);

  const handleClusterUpdate = React.useCallback(
    async (clusterId: Cluster['id'], params: ClusterDetailsUpdateParams) => {
      clearAlerts();

      try {
        const { data: updatedCluster } = await ClustersService.update(
          clusterId,
          cluster?.tags,
          params,
        );
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

  const handleCustomManifestsChange = React.useCallback(
    async (clusterId: string, addCustomManifests: boolean) => {
      const addCustomManifestsNew = customManifests ? customManifests.length === 0 : true;
      if (addCustomManifests && addCustomManifestsNew && clusterId) {
        await ClustersService.createDummyManifest(clusterId);
      }
    },
    [customManifests],
  );

  const handleClusterCreate = React.useCallback(
    async (params: ClusterCreateParamsWithStaticNetworking, addCustomManifests: boolean) => {
      clearAlerts();
      try {
        const cluster = await ClustersService.create(params);
        history.push(`${routeBasePath}/clusters/${cluster.id}`, ClusterWizardFlowStateNew);
        await handleCustomManifestsChange(cluster.id, addCustomManifests);
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to create new cluster', message: getApiErrorMessage(e) }),
        );
        if (isUnknownServerError(e as Error)) {
          dispatch(setServerUpdateError());
        }
      }
    },
    [clearAlerts, addAlert, dispatch, history, handleCustomManifestsChange],
  );

  if (pullSecret === undefined || !managedDomains || loadingOCPVersions || !usedClusterNames) {
    return (
      <ClusterWizardStep navigation={<ClusterWizardNavigation cluster={cluster} />}>
        <LoadingState />
      </ClusterWizardStep>
    );
  }
  const navigation = <ClusterWizardNavigation cluster={cluster} />;

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
      handleCustomManifestsChange={handleCustomManifestsChange}
      navigation={navigation}
      infraEnv={infraEnv}
    />
  );
};

export default ClusterDetails;
