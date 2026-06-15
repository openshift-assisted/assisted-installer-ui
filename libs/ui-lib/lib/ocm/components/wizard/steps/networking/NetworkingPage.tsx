import React from 'react';
import { FormikConfig, Formik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import {
  Cluster,
  V2ClusterUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  CpuArchitecture,
  useAlerts,
  getHostSubnets,
  useNewFeatureSupportLevel,
  NetworkConfigurationValues,
  isSNO,
  SINGLE_STACK,
  handleApiError,
  getApiErrorMessage,
  isUnknownServerError,
  LoadingState,
  useTranslation,
} from '../../../../../common';
import { captureException } from '../../../../sentry';
import { ClustersService } from '../../../../services';
import { usePullSecret, useInfraEnv } from '../../../../hooks';
import {
  selectCurrentClusterPermissionsState,
  updateClusterBase,
  setServerUpdateError,
} from '../../../../store';
import { useDefaultConfiguration } from '../../../../contexts';
import { NetworkConfigurationForm } from './NetworkConfigurationForm';
import { getNetworkValidationSchema } from './validationSchema';
import { getNetworkInitialValues } from './initialValues';

export const NetworkingPage = ({ cluster }: { cluster: Cluster }) => {
  const { t } = useTranslation();
  const pullSecret = usePullSecret();
  const {
    infraEnv,
    error: infraEnvError,
    isLoading,
  } = useInfraEnv(
    cluster.id,
    cluster.cpuArchitecture
      ? (cluster.cpuArchitecture as CpuArchitecture)
      : CpuArchitecture.USE_DAY1_ARCHITECTURE,
    cluster.name,
    pullSecret,
    cluster.openshiftVersion,
  );
  const defaultNetworkValues = useDefaultConfiguration([
    'clusterNetworksDualstack',
    'clusterNetworksIpv4',
    'serviceNetworksDualstack',
    'serviceNetworksIpv4',
  ]);

  const { addAlert, clearAlerts, alerts } = useAlerts();
  const dispatch = useDispatch();
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const hostSubnets = React.useMemo(() => getHostSubnets(cluster, true), [cluster]);
  const featureSupportLevelData = useNewFeatureSupportLevel();
  const isClusterManagedNetworkingUnsupported = !featureSupportLevelData.isFeatureSupported(
    'CLUSTER_MANAGED_NETWORKING',
  );
  const initialValues = React.useMemo(
    () =>
      getNetworkInitialValues(cluster, defaultNetworkValues, isClusterManagedNetworkingUnsupported),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // just once, Formik does not reinitialize
  );

  const memoizedValidationSchema = React.useMemo(
    () => getNetworkValidationSchema(initialValues, hostSubnets, t, cluster.openshiftVersion),
    [initialValues, hostSubnets, t, cluster.openshiftVersion],
  );

  React.useEffect(() => {
    if (infraEnvError) {
      const title = `Failed to retrieve infra env (clusterId: ${cluster.id})`;
      //TODO(brotman) add handling of existing errors to alerts context
      if (alerts.find((alert) => alert.title === title)) {
        return;
      }
      captureException(infraEnvError, title);
      addAlert({
        title,
        message: infraEnvError,
      });
    }
    //shouldn't respond to cluster polling. shouldn't respond to alerts changes so remove alert wouldn't trigger adding it back
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [infraEnvError]);

  const handleSubmit: FormikConfig<NetworkConfigurationValues>['onSubmit'] = async (values) => {
    clearAlerts();
    // update the cluster configuration
    try {
      const isMultiNodeCluster = !isSNO(cluster);
      const isUserManagedNetworking = values.managedNetworkingType === 'userManaged';

      // Only send VIPs that have a non-empty IP;
      const apiVips = (values.apiVips || []).filter((v) => (v?.ip ?? '').trim() !== '');
      const ingressVips = (values.ingressVips || []).filter((v) => (v?.ip ?? '').trim() !== '');

      const params: V2ClusterUpdateParams = {
        apiVips,
        ingressVips,
        sshPublicKey: values.sshPublicKey,
        vipDhcpAllocation: values.vipDhcpAllocation,
        networkType: values.networkType,
        machineNetworks: values.machineNetworks,
        clusterNetworks: values.clusterNetworks,
        serviceNetworks: values.serviceNetworks,
        userManagedNetworking: isUserManagedNetworking,
      };
      if (params.userManagedNetworking) {
        params.apiVips = [];
        params.ingressVips = [];
        if (isMultiNodeCluster) {
          delete params.machineNetworks;
        }
      } else {
        // cluster-managed can't be chosen in SNO, so this must be a multi-node cluster
        if (values.vipDhcpAllocation) {
          delete params.apiVips;
          delete params.ingressVips;
        } else if (values.stackType === SINGLE_STACK) {
          // The API will rebuild the default machineNetwork
          params.machineNetworks = [];
        }
      }

      const { data } = await ClustersService.update(cluster.id, cluster.tags, params);
      dispatch(updateClusterBase(data));
    } catch (e) {
      handleApiError(e, () =>
        addAlert({ title: 'Failed to update the cluster', message: getApiErrorMessage(e) }),
      );
      if (isUnknownServerError(e as Error)) {
        dispatch(setServerUpdateError());
      }
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  const onSubmit = isViewerMode ? () => Promise.resolve() : handleSubmit;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={memoizedValidationSchema}
      onSubmit={onSubmit}
      validateOnMount
    >
      <NetworkConfigurationForm
        cluster={cluster}
        hostSubnets={hostSubnets}
        defaultNetworkSettings={defaultNetworkValues}
        infraEnv={infraEnv}
      />
    </Formik>
  );
};
