import * as React from 'react';
import {
  AgentServiceConfigK8sResource,
  InfraEnvK8sResource,
  OsImage,
  SecretK8sResource,
} from '../../../types';
import { useK8sWatchResource } from '../../../hooks/useK8sWatchResource';
import { AgentServiceConfigModel, InfraEnvModel, SecretModel } from '../../../types/models';

export const useInfraEnvResources = (): [
  string[],
  OsImage[],
  SecretK8sResource[],
  boolean,
  unknown,
] => {
  const [infraEnvironments, infraLoaded, infraErr] = useK8sWatchResource<InfraEnvK8sResource[]>({
    groupVersionKind: {
      kind: InfraEnvModel.kind,
      version: InfraEnvModel.apiVersion,
      group: InfraEnvModel.apiGroup,
    },
    isList: true,
  });

  const [agentServiceConfigs, agentLoaded, agentErr] = useK8sWatchResource<
    AgentServiceConfigK8sResource[]
  >({
    groupVersionKind: {
      kind: AgentServiceConfigModel.kind,
      version: AgentServiceConfigModel.apiVersion,
      group: AgentServiceConfigModel.apiGroup,
    },
    isList: true,
  });

  const [credentials, credsLoaded, credsErr] = useK8sWatchResource<SecretK8sResource[]>({
    groupVersionKind: {
      kind: SecretModel.kind,
      version: SecretModel.apiVersion,
    },
    isList: true,
    selector: {
      matchExpressions: [
        {
          key: 'cluster.open-cluster-management.io/type',
          operator: 'In',
          values: ['hostinventory', 'nutanix'],
        },
      ],
    },
  });

  const usedNames = React.useMemo(
    () => infraEnvironments.map((ie) => ie.metadata?.name || ''),
    [infraEnvironments],
  );

  const osImages = agentServiceConfigs?.[0]?.spec.osImages || [];

  return [
    usedNames,
    osImages,
    credentials,
    infraLoaded && agentLoaded && credsLoaded,
    infraErr || agentErr || credsErr,
  ];
};
