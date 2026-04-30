import { useCallback, useEffect, useRef, useState } from 'react';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { CpuArchitecture, useAlerts } from '../../common';
import useInfraEnvHosts from './useInfraEnvHosts';
import HostsService from '../services/HostsService';
import { getErrorMessage } from '../../common/utils';
import { useFeature } from './use-feature';

const MAX_BIND_RETRY_ATTEMPTS = 3;

const useLateBinding = (cluster: Cluster): boolean => {
  const [isBinding, setIsBinding] = useState(false);
  const { addAlert, removeAlert, alerts } = useAlerts();
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const bindFailureCounts = useRef<Map<string, number>>(new Map());
  const alertsRef = useRef(alerts);
  alertsRef.current = alerts;

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

  const bindSingleHost = useCallback(
    async (host: NonNullable<typeof infraEnvHosts>[number]) => {
      setIsBinding(true);
      try {
        await HostsService.bind(host, cluster.id);
        // Binding succeeded: reset the failure counter and clear any alert that
        // was shown after previous exhausted retries.
        bindFailureCounts.current.delete(host.id);
        const alertKey = alertsRef.current.find((alert) => alert.key === host.id)?.key;
        if (alertKey) {
          removeAlert(alertKey);
        }
      } catch (error) {
        const failureCount = (bindFailureCounts.current.get(host.id) ?? 0) + 1;
        bindFailureCounts.current.set(host.id, failureCount);

        // Suppress transient errors (e.g. 5xx during self-healing) and only
        // surface the alert once silent retries have been exhausted.
        if (failureCount >= MAX_BIND_RETRY_ATTEMPTS) {
          addAlert({
            title: `Failed to bind host ${host.requestedHostname || ''}`,
            message: getErrorMessage(error),
            key: host.id,
          });
        }
      } finally {
        setIsBinding(false);
      }
    },
    [cluster.id, addAlert, removeAlert],
  );

  const bindHosts = useCallback(async () => {
    if (!infraEnvHosts || infraEnvError || infraEnvLoading || !isSingleClusterFeatureEnabled) {
      return;
    }
    for (const host of infraEnvHosts) {
      if (host.clusterId !== cluster.id) {
        await bindSingleHost(host);
      }
    }
  }, [
    infraEnvHosts,
    infraEnvError,
    infraEnvLoading,
    isSingleClusterFeatureEnabled,
    cluster.id,
    bindSingleHost,
  ]);

  useEffect(() => {
    if (isSingleClusterFeatureEnabled) {
      void bindHosts();
    }
  }, [isSingleClusterFeatureEnabled, bindHosts]);

  return infraEnvLoading || isBinding;
};

export default useLateBinding;
