import { useCallback, useEffect, useState } from 'react';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { CpuArchitecture, useAlerts } from '@openshift-assisted/common';
import useInfraEnvHosts from './useInfraEnvHosts';
import HostsService from '../services/HostsService';
import { getErrorMessage } from '@openshift-assisted/common/utils';
import { useFeature } from './use-feature';

const useLateBinding = (cluster: Cluster): boolean => {
  const [isBinding, setIsBinding] = useState(false);
  const { addAlert, removeAlert, alerts } = useAlerts();
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');

  const {
    hosts: infraEnvHosts,
    error: infraEnvError,
    isLoading: infraEnvLoading,
  } = useInfraEnvHosts(
    isSingleClusterFeatureEnabled ? cluster.id : '',
    cluster.cpuArchitecture
      ? (cluster.cpuArchitecture as CpuArchitecture)
      : CpuArchitecture.USE_DAY1_ARCHITECTURE,
    cluster.name,
    undefined,
    cluster.openshiftVersion,
  );

  const bindHosts = useCallback(async () => {
    if (infraEnvHosts && !infraEnvError && !infraEnvLoading && isSingleClusterFeatureEnabled) {
      for (const host of infraEnvHosts) {
        if (host.clusterId !== cluster.id) {
          setIsBinding(true);
          try {
            const alertKey = alerts.find((alert) => alert.key === host.id)?.key;
            if (alertKey) {
              removeAlert(alertKey);
            }
            await HostsService.bind(host, cluster.id);
          } catch (error) {
            addAlert({
              title: `Failed to bind host ${host.requestedHostname || ''}`,
              message: getErrorMessage(error),
              key: host.id,
            });
          } finally {
            setIsBinding(false);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    infraEnvHosts,
    infraEnvError,
    infraEnvLoading,
    isSingleClusterFeatureEnabled,
    cluster.id,
    addAlert,
    removeAlert,
  ]);

  useEffect(() => {
    if (isSingleClusterFeatureEnabled) {
      void bindHosts();
    }
  }, [isSingleClusterFeatureEnabled, bindHosts]);

  return infraEnvLoading || isBinding;
};

export default useLateBinding;
