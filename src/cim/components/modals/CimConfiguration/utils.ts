import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { AgentServiceConfigConditionType, AgentServiceConfigK8sResource } from '../../../types';
import { getConditionByType } from '../../../utils';
import { CIM_CONFIG_TIMEOUT } from './constants';

export const LOCAL_STORAGE_ID_LAST_UPDATE_TIMESTAMP = 'cim-config-configuring-started-at';

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
  const deploymentsHealthyCondition = getConditionByType<AgentServiceConfigConditionType>(
    agentServiceConfig?.status?.conditions || [],
    'DeploymentsHealthy',
  );

  return deploymentsHealthyCondition?.status === 'True';
};

export const isCIMConfigProgressing = ({
  agentServiceConfig,
}: {
  agentServiceConfig?: AgentServiceConfigK8sResource;
}): boolean => {
  if (!agentServiceConfig) {
    return false;
  }

  const deploymentsHealthyCondition = getConditionByType<AgentServiceConfigConditionType>(
    agentServiceConfig?.status?.conditions || [],
    'DeploymentsHealthy',
  );

  const now = Date.now();

  // Potential post-creation change of the ingress controller (from No to Yes) forces the AI deployment reconciliation and so reporting "errors" during the course.
  // For that reason we can not reuse AgentServiceController's creationTimestamp to report issues with a graceful delay.
  // We can store timestamp into a label or simply to the localStorage - let's see if that is an issue in a multi-tenant environment.
  const updateTime = new Date(
    // agentServiceConfig.metadata?.creationTimestamp || 0,
    window.localStorage.getItem(LOCAL_STORAGE_ID_LAST_UPDATE_TIMESTAMP) || 0,
  );
  const withinProgressingTimePerion: boolean = now - updateTime.valueOf() < CIM_CONFIG_TIMEOUT;

  return (
    !deploymentsHealthyCondition ||
    deploymentsHealthyCondition.status === 'Unknown' ||
    (deploymentsHealthyCondition.status === 'False' && withinProgressingTimePerion)
  );
};

export const isStorageConfigured = ({
  storageClasses,
}: {
  storageClasses?: K8sResourceCommon[];
}): boolean => !!storageClasses && storageClasses.length > 0;
