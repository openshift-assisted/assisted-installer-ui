import React from 'react';
import { Cluster, InfraEnv } from '../../common';
import { getErrorMessage } from '../../common/utils';
import { InfraEnvsService } from '../services';

export default function useInfraEnvId(clusterId: Cluster['id']) {
  const [infraEnvId, setInfraEnv] = React.useState<InfraEnv['id']>();
  const [error, setError] = React.useState('');

  const findInfraEnvId = React.useCallback(async () => {
    try {
      const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
      setInfraEnv(infraEnvId);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [clusterId]);

  React.useEffect(() => {
    if (!infraEnvId) {
      findInfraEnvId();
    }
  }, [clusterId, findInfraEnvId, infraEnvId]);

  return { infraEnvId, error };
}
