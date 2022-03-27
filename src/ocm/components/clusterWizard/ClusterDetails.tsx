import React from 'react';
import omit from 'lodash/omit';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Cluster,
  ClusterCreateParams,
  V2ClusterUpdateParams,
  useAlerts,
  LoadingState,
  ClusterWizardStep,
} from '../../../common';
import { usePullSecret } from '../../hooks';
import { getErrorMessage, handleApiError } from '../../api';
import { updateCluster } from '../../reducers/clusters';
import ClusterWizardContext from './ClusterWizardContext';
import { canNextClusterDetails, ClusterWizardFlowStateType } from './wizardTransition';
import { useOpenshiftVersions, useManagedDomains, useUsedClusterNames } from '../../hooks';
import ClusterDetailsForm from './ClusterDetailsForm';
import ClusterWizardNavigation from './ClusterWizardNavigation';
import { routeBasePath } from '../../config';
import { ClusterDetailsService } from '../../services';

type ClusterDetailsProps = {
  cluster?: Cluster;
};

const ClusterDetails: React.FC<ClusterDetailsProps> = ({ cluster }) => {
  const { setCurrentStepId } = React.useContext(ClusterWizardContext);
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

  const moveNext = React.useCallback(() => setCurrentStepId('host-discovery'), [setCurrentStepId]);

  const handleClusterUpdate = React.useCallback(
    async (clusterId: Cluster['id'], values: V2ClusterUpdateParams) => {
      clearAlerts();
      const params: V2ClusterUpdateParams = omit(values, [
        'highAvailabilityMode',
        'pullSecret',
        'openshiftVersion',
      ]);

      try {
        const cluster = await ClusterDetailsService.update(clusterId, params);
        dispatch(updateCluster(cluster));

        canNextClusterDetails({ cluster }) && moveNext();
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to update the cluster', message: getErrorMessage(e) }),
        );
      }
    },
    [addAlert, clearAlerts, dispatch, moveNext],
  );

  const handleClusterCreate = React.useCallback(
    async (params: ClusterCreateParams) => {
      clearAlerts();

      try {
        const cluster = await ClusterDetailsService.create(params);
        const locationState: ClusterWizardFlowStateType = 'new';
        // TODO(mlibra): figure out subscription ID and navigate to ${routeBasePath}/../details/s/${subscriptionId} instead
        history.push(`${routeBasePath}/clusters/${cluster.id}`, locationState);
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to create new cluster', message: getErrorMessage(e) }),
        );
      }
    },
    [addAlert, clearAlerts, history],
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
      moveNext={moveNext}
      handleClusterUpdate={handleClusterUpdate}
      handleClusterCreate={handleClusterCreate}
      navigation={navigation}
    />
  );
};

export default ClusterDetails;
