import * as React from 'react';
import { InfraEnvK8sResource, NMStateK8sResource } from '../types';
import { useK8sWatchResource, WatchK8sResult } from './useK8sWatchResource';
import { NMStateModel } from '../types/models';
import { isMatch } from 'lodash-es';

export const useNMStates = (
  infraEnv: InfraEnvK8sResource | undefined,
): WatchK8sResult<NMStateK8sResource[]> => {
  const [nmStates, loaded, err] = useK8sWatchResource<NMStateK8sResource[]>(
    {
      groupVersionKind: {
        kind: NMStateModel.kind,
        version: NMStateModel.apiVersion,
        group: NMStateModel.apiGroup,
      },
      isList: true,
    },
    infraEnv ? { namespace: infraEnv.metadata?.namespace } : null,
  );

  const infraEnvNMStates = React.useMemo(
    () =>
      nmStates.filter((nmStateConfig) => {
        if (!Object.keys(infraEnv?.spec?.nmStateConfigLabelSelector?.matchLabels || {}).length) {
          return false;
        }
        return isMatch(
          nmStateConfig.metadata?.labels || {},
          infraEnv?.spec?.nmStateConfigLabelSelector?.matchLabels || {},
        );
      }),
    [nmStates, infraEnv],
  );

  return [infraEnvNMStates, loaded, err];
};
