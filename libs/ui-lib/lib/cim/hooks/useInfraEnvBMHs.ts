import { INFRAENV_AGENTINSTALL_LABEL_KEY } from '../components/common/constants';
import { BareMetalHostK8sResource, InfraEnvK8sResource } from '../types';
import { BMHModel } from '../types/models';
import { useK8sWatchResource, WatchK8sResult } from './useK8sWatchResource';

export const useInfraEnvBMHs = (
  infraEnv: InfraEnvK8sResource | undefined,
): WatchK8sResult<BareMetalHostK8sResource[]> => {
  const [bmhs, loaded, err] = useK8sWatchResource<BareMetalHostK8sResource[]>(
    infraEnv
      ? {
          groupVersionKind: {
            kind: BMHModel.kind,
            version: BMHModel.apiVersion,
            group: BMHModel.apiGroup,
          },
          namespace: infraEnv.metadata?.namespace,
          isList: true,
          selector: {
            matchLabels: {
              [INFRAENV_AGENTINSTALL_LABEL_KEY]: infraEnv?.metadata?.name || '',
            },
          },
        }
      : null,
  );

  return [bmhs, loaded, err];
};
