import React from 'react';
import {
  Cluster,
  InfraEnv,
  InfraEnvCreateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import { CpuArchitecture, getErrorMessage } from '../../common';
import { InfraEnvsService } from '../services';
import { useFeature } from './use-feature';

export const useInfraEnvId = (
  clusterId: Cluster['id'],
  cpuArchitecture: CpuArchitecture,
  clusterName?: string,
  pullSecret?: string,
  openshiftVersion?: string,
) => {
  const [infraEnvId, setInfraEnv] = React.useState<InfraEnv['id']>();
  const [error, setError] = React.useState('');
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');

  const findInfraEnvId = React.useCallback(async () => {
    try {
      const infraEnvId = await InfraEnvsService.getInfraEnvId(
        clusterId,
        cpuArchitecture,
        isSingleClusterFeatureEnabled,
      );
      if (infraEnvId && !(infraEnvId instanceof Error)) {
        setInfraEnv(infraEnvId);
      } else {
        //If infraEnv doesn't exist create a new one
        if (pullSecret) {
          const infraEnv = await InfraEnvsService.create({
            name: InfraEnvsService.makeInfraEnvName(cpuArchitecture, clusterName),
            pullSecret,
            clusterId,
            openshiftVersion,
            cpuArchitecture: cpuArchitecture as InfraEnvCreateParams['cpuArchitecture'],
          });
          setInfraEnv(infraEnv.id);
        }
      }
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [
    clusterId,
    cpuArchitecture,
    isSingleClusterFeatureEnabled,
    pullSecret,
    clusterName,
    openshiftVersion,
  ]);

  React.useEffect(() => {
    if (!clusterId && !isSingleClusterFeatureEnabled) {
      setError('Missing clusterId to load infrastructure environment');
    } else if (!infraEnvId) {
      void findInfraEnvId();
    }
  }, [clusterId, findInfraEnvId, infraEnvId, isSingleClusterFeatureEnabled]);

  return { infraEnvId, error };
};
