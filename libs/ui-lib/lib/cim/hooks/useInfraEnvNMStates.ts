import * as React from 'react';
import { InfraEnvK8sResource, NMStateK8sResource } from '../types';
import { useK8sWatchResource, WatchK8sResult } from './useK8sWatchResource';
import { NMStateModel } from '../types/models';
import { getInfraEnvNMStates } from '../utils';

export const useInfraEnvNMStates = (
  infraEnv: InfraEnvK8sResource | undefined,
): WatchK8sResult<NMStateK8sResource[]> => {
  const [nmStates, loaded, err] = useK8sWatchResource<NMStateK8sResource[]>(
    infraEnv
      ? {
          groupVersionKind: {
            kind: NMStateModel.kind,
            version: NMStateModel.apiVersion,
            group: NMStateModel.apiGroup,
          },
          namespace: infraEnv.metadata?.namespace,
          isList: true,
        }
      : null,
  );

  const infraEnvNMStates = React.useMemo(
    () => getInfraEnvNMStates(nmStates, infraEnv),
    [nmStates, infraEnv],
  );

  return [infraEnvNMStates, loaded, err];
};
