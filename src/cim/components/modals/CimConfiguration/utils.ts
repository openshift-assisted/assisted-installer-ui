import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { AgentServiceConfigConditionType, AgentServiceConfigK8sResource } from '../../../types';
import { getConditionsByType } from '../../../utils';

export const isCIMEnabled = ({
  agentServiceConfig,
}: {
  agentServiceConfig?: AgentServiceConfigK8sResource;
}): boolean => !!agentServiceConfig;

export const isCIMConfigured = ({
  agentServiceConfig,
}: {
  agentServiceConfig?: AgentServiceConfigK8sResource;
}): boolean => {
  const deploymentsHealthyCondition = getConditionsByType<AgentServiceConfigConditionType>(
    agentServiceConfig?.status?.conditions || [],
    'DeploymentsHealthy',
  )?.[0];

  return deploymentsHealthyCondition?.status === 'True';
};

export const isCIMConfigProgressing = ({
  agentServiceConfig,
}: {
  agentServiceConfig?: AgentServiceConfigK8sResource;
}): boolean => {
  const deploymentsHealthyCondition = getConditionsByType<AgentServiceConfigConditionType>(
    agentServiceConfig?.status?.conditions || [],
    'DeploymentsHealthy',
  )?.[0];

  return !deploymentsHealthyCondition || deploymentsHealthyCondition.status === 'Unknown';
};

export const isStorageConfigured = ({
  storageClasses,
}: {
  storageClasses?: K8sResourceCommon[];
}): boolean => !!storageClasses && storageClasses.length > 0;
