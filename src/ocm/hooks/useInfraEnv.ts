import React from 'react';
import { useInfraEnvId } from '.';
import { Cluster, InfraEnv } from '../../common';
import { APIErrorMixin } from '../api/types';
import { InfraEnvsAPI } from '../services/apis';

export default function useInfraEnv(clusterId: Cluster['id']) {
  const [infraEnv, setInfraEnv] = React.useState<InfraEnv>();
  const [error, setError] = React.useState<APIErrorMixin & Error>();

  const { infraEnvId, error: infraEnvIdError } = useInfraEnvId(clusterId);

  React.useEffect(() => {
    if (infraEnvIdError) {
      setError(infraEnvIdError);
    } else {
      const getInfraEnv = async () => {
        try {
          if (infraEnvId) {
            const { data: infraEnv } = await InfraEnvsAPI.get(infraEnvId);
            setInfraEnv(infraEnv);
          }
        } catch (e) {
          setError(e);
        }
      };
      if (!infraEnv) {
        void getInfraEnv();
      }
    }
  }, [infraEnv, infraEnvId, infraEnvIdError]);

  return { infraEnv, infraEnvId, error, isLoadingInfraEnv: !infraEnv && !error };
}
