import React from 'react';
import { Cluster, InfraEnv } from '../../common';
import { APIErrorMixin } from '../api/types';
import { InfraEnvsService } from '../services';

type ErrorType = APIErrorMixin & Error;

export default function useInfraEnvId(clusterId: Cluster['id']) {
  const [infraEnvId, setInfraEnv] = React.useState<InfraEnv['id']>();
  const [error, setError] = React.useState<ErrorType>();

  const findInfraEnvId = React.useCallback(async () => {
    try {
      const infraEnvId = await InfraEnvsService.getInfraEnvId(clusterId);
      setInfraEnv(infraEnvId);
    } catch (e) {
      setError(e as ErrorType);
    }
  }, [clusterId]);

  React.useEffect(() => {
    if (!infraEnvId) {
      findInfraEnvId();
    }
  }, [clusterId, findInfraEnvId, infraEnvId]);

  return { infraEnvId, error };
}
