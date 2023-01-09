import React from 'react';
import omit from 'lodash/omit';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Cluster,
  V2ClusterUpdateParams,
  useAlerts,
  LoadingState,
  ClusterWizardStep,
  InfraEnv,
} from '../../../common';
import { usePullSecret } from '../../hooks';
import { getApiErrorMessage, handleApiError, isUnknownServerError } from '../../api';
import { setServerUpdateError, updateCluster } from '../../reducers/clusters';
import { useClusterWizardContext } from './ClusterWizardContext';
import { canNextClusterDetails, ClusterWizardFlowStateNew } from './wizardTransition';
import { useOpenshiftVersions, useManagedDomains, useUsedClusterNames } from '../../hooks';
import ClusterDetailsForm from './ClusterDetailsForm';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import { routeBasePath } from '../../config';
import { ClustersService } from '../../services';
import { ClusterCreateParamsWithStaticNetworking } from '../../services/types';

type ClusterDetailsProps = {
  cluster?: Cluster;
  infraEnv?: InfraEnv;
};

const ClusterDetails: React.FC<ClusterDetailsProps> = ({ cluster, infraEnv }) => {
  const clusterWizardContext = useClusterWizardContext();
  const managedDomains = useManagedDomains();
  const { addAlert, clearAlerts } = useAlerts();
  const history = useHistory();
  const dispatch = useDispatch();
  const { usedClusterNames } = useUsedClusterNames(cluster?.id || '');
  const pullSecret = usePullSecret();
  const { error: errorOCPVersions, loading: loadingOCPVersions, versions } = useOpenshiftVersions();
  React.useEffect(() => {
    errorOCPVersions && addAlert(errorOCPVersions);
  }, [errorOCPVersions, addAlert]);

  const handleClusterUpdate = React.useCallback(
    async (clusterId: Cluster['id'], values: V2ClusterUpdateParams) => {
      clearAlerts();
      const params: V2ClusterUpdateParams = omit(values, [
        'highAvailabilityMode',
        'pullSecret',
        'openshiftVersion',
      ]);
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

  const handleClusterCreate = React.useCallback(
    async (params: ClusterCreateParamsWithStaticNetworking) => {
      clearAlerts();
      try {
        const cluster = await ClustersService.create(params);
        history.push(`${routeBasePath}/clusters/${cluster.id}`, ClusterWizardFlowStateNew);
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to create new cluster', message: getApiErrorMessage(e) }),
        );
        if (isUnknownServerError(e as Error)) {
          dispatch(setServerUpdateError());
        }
      }
    },
    [clearAlerts, addAlert, dispatch, history],
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
      navigation={navigation}
      infraEnv={infraEnv}
    />
  );
};

export default ClusterDetails;
