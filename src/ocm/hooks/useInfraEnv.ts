import React from 'react';
import { useInfraEnvId } from '.';
import { Cluster, InfraEnv, InfraEnvUpdateParams } from '../../common';
import { APIErrorMixin } from '../api/types';
import { InfraEnvsAPI } from '../services/apis';

export default function useInfraEnv(clusterId: Cluster['id']) {
  const [infraEnv, setInfraEnv] = React.useState<InfraEnv>();
  const [error, setError] = React.useState<APIErrorMixin & Error>();
  const { infraEnvId, error: infraEnvIdError } = useInfraEnvId(clusterId);

  const getInfraEnv = React.useCallback(async () => {
    try {
      if (infraEnvId) {
        const { data: infraEnv } = await InfraEnvsAPI.get(infraEnvId);
        setInfraEnv(infraEnv);
      }
    } catch (e) {
      setError(e);
    }
  }, [infraEnvId]);

  const updateInfraEnv = React.useCallback(
    async (infraEnvUpdateParams: InfraEnvUpdateParams) => {
      if (!infraEnvId) {
        throw 'updateInfraEnv should not be called before infra env was loaded';
      }
      const { data } = await InfraEnvsAPI.update(infraEnvId, infraEnvUpdateParams);
      setInfraEnv(data);
      return data;
    },
    [infraEnvId],
  );

  React.useEffect(() => {
    if (infraEnvIdError) {
      setError(infraEnvIdError);
    } else {
      if (!infraEnv) {
        getInfraEnv();
      }
    }
  }, [getInfraEnv, infraEnv, infraEnvId, infraEnvIdError]);

  return { infraEnv, error, isLoading: !infraEnv && !error, updateInfraEnv };
}
