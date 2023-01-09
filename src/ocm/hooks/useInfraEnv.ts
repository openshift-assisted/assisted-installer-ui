import React from 'react';
import { useInfraEnvId } from '.';
import { Cluster, CpuArchitecture, InfraEnv, InfraEnvUpdateParams } from '../../common';
import { getErrorMessage } from '../../common/utils';
import { InfraEnvsAPI } from '../services/apis';

export default function useInfraEnv(clusterId: Cluster['id'], cpuArchitecture: CpuArchitecture) {
  const [infraEnv, setInfraEnv] = React.useState<InfraEnv>();
  const [error, setError] = React.useState('');
  const { infraEnvId, error: infraEnvIdError } = useInfraEnvId(clusterId, cpuArchitecture);

  const getInfraEnv = React.useCallback(async () => {
    try {
      if (infraEnvId) {
        const { data: infraEnv } = await InfraEnvsAPI.get(infraEnvId);
        setInfraEnv(infraEnv);
      }
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [infraEnvId]);

  const updateInfraEnv = React.useCallback(
    async (infraEnvUpdateParams: InfraEnvUpdateParams) => {
      if (!infraEnvId) {
        throw 'updateInfraEnv should not be called before infra env was loaded';
      }
      InfraEnvsAPI.abortLastGetRequest();
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
        void getInfraEnv();
      }
    }
  }, [getInfraEnv, infraEnv, infraEnvId, infraEnvIdError]);

  return { infraEnv, error, isLoading: !infraEnv && !error, updateInfraEnv };
}
