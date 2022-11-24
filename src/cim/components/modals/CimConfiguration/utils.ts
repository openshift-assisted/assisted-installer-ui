import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { AgentServiceConfigK8sResource } from '../../../types';

export const isCIMEnabled = ({
  agentServiceConfig,
}: {
  agentServiceConfig?: AgentServiceConfigK8sResource;
}): boolean => !!agentServiceConfig;

export const isStorageConfigured = ({
  storageClasses,
}: {
  storageClasses?: K8sResourceCommon[];
}): boolean => !!storageClasses && storageClasses.length > 0;
