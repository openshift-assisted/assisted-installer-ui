import { useCallback, useEffect, useState } from 'react';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { CpuArchitecture, useAlerts } from '../../common';
import useInfraEnvHosts from './useInfraEnvHosts';
import HostsService from '../services/HostsService';
import { getErrorMessage } from '../../common/utils';

const useLateBinding = (
  cluster: Cluster,
  isSingleClusterFeatureEnabled: boolean,
): { isBinding: boolean } => {
  const [isBinding, setIsBinding] = useState(false);
  const { addAlert, removeAlert, alerts } = useAlerts();

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
            const alertKey = alerts.find(
              (alert) => alert.title === `Failed to bind host ${host.requestedHostname || ''}`,
            )?.key;
            if (alertKey) {
              removeAlert(alertKey);
            }
            await HostsService.bind(host, cluster.id);
          } catch (error) {
            addAlert({
              title: `Failed to bind host ${host.requestedHostname || ''}`,
              message: getErrorMessage(error),
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

  return {
    isBinding: infraEnvLoading || isBinding,
  };
};

export default useLateBinding;
