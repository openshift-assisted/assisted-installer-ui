import { k8sDelete, k8sPatch, Patch } from '@openshift-console/dynamic-plugin-sdk';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  BareMetalHostK8sResource,
  InfraEnvK8sResource,
  InfrastructureK8sResource,
  NMStateK8sResource,
  StatusCondition,
} from './types';
import { isEqual, isMatch } from 'lodash-es';
import { AgentClusterInstallModel, AgentModel, BMHModel, NMStateModel } from './types/models';
import { AGENT_BMH_NAME_LABEL_KEY, BMH_HOSTNAME_ANNOTATION } from './components/common/constants';

export function getConditionByType<ConditionType>(
  conditions: StatusCondition<ConditionType>[],
  type: ConditionType,
): StatusCondition<ConditionType> | undefined {
  return conditions.find((c) => c.type === type);
}

export const appendPatch = <V>(patches: Patch[], path: string, newVal?: V, existingVal?: V) => {
  if (!isEqual(newVal, existingVal)) {
    patches.push({
      op: existingVal === undefined ? 'add' : 'replace',
      path,
      value: newVal,
    });
  }
};

export const onApproveAgent = (agent: AgentK8sResource) => {
  const patches: Patch[] = [];
  appendPatch(patches, '/spec/approved', true, agent.spec?.approved);
  return k8sPatch({ model: AgentModel, resource: agent, data: patches });
};

export const onChangeHostname = (agent: AgentK8sResource, hostname: string) => {
  const patches: Patch[] = [];
  appendPatch(patches, '/spec/hostname', hostname, agent.spec?.hostname);
  return k8sPatch({ model: AgentModel, resource: agent, data: patches });
};

export const onChangeBMHHostname = (bmh: BareMetalHostK8sResource, hostname: string) => {
  const patches: Patch[] = [];
  const prevHostname = bmh.metadata?.annotations?.[BMH_HOSTNAME_ANNOTATION] || '';
  appendPatch(
    patches,
    `/metadata/annotations/${BMH_HOSTNAME_ANNOTATION.replace('/', '~1')}`,
    hostname,
    prevHostname,
  );
  return k8sPatch({ model: BMHModel, resource: bmh, data: patches });
};

const setProvisionRequirements = (
  agentClusterInstall: AgentClusterInstallK8sResource,
  workerCount: number | undefined,
  masterCount: number | undefined,
) => {
  const provisionRequirements = { ...(agentClusterInstall.spec?.provisionRequirements || {}) };
  if (workerCount !== undefined) {
    provisionRequirements.workerAgents = workerCount;
  }
  if (masterCount !== undefined) {
    provisionRequirements.controlPlaneAgents = masterCount;
  }

  return k8sPatch({
    model: AgentClusterInstallModel,
    resource: agentClusterInstall,
    data: [
      {
        op: agentClusterInstall.spec?.provisionRequirements ? 'replace' : 'add',
        path: '/spec/provisionRequirements',
        value: provisionRequirements,
      },
    ],
  });
};

export const deleteHost = async (
  agent?: AgentK8sResource,
  bmh?: BareMetalHostK8sResource,
  agentClusterInstall?: AgentClusterInstallK8sResource,
  nmStates: NMStateK8sResource[] = [],
) => {
  if (agent) {
    await k8sDelete({
      model: AgentModel,
      resource: agent,
    });
  }
  if (bmh) {
    await k8sDelete({
      model: BMHModel,
      resource: bmh,
    });

    const bmhNMStates = (nmStates || []).filter(
      (nm) => nm.metadata?.labels?.[AGENT_BMH_NAME_LABEL_KEY] === bmh.metadata?.name,
    );
    for (const nmState of bmhNMStates) {
      await k8sDelete({
        model: NMStateModel,
        resource: nmState,
      });
    }
  }

  if (agentClusterInstall) {
    const masterCount = undefined; /* Only workers can be removed */
    const workerCount = agentClusterInstall.spec?.provisionRequirements.workerAgents || 1;
    await setProvisionRequirements(agentClusterInstall, Math.max(0, workerCount - 1), masterCount);
  }
};

export const getAgentName = (resource?: AgentK8sResource | BareMetalHostK8sResource): string => {
  if (resource && 'spec' in resource && resource.spec && 'hostname' in resource.spec) {
    return resource.spec.hostname || resource?.metadata?.name || '-';
  }
  return resource?.metadata?.name || '-';
};

export const onUnbindHost = async (
  agent: AgentK8sResource,
  agentClusterInstall?: AgentClusterInstallK8sResource,
) => {
  if (agent.spec?.clusterDeploymentName?.name) {
    if (agentClusterInstall) {
      const masterCount = undefined; /* Only workers can be removed */
      const workerCount = agentClusterInstall.spec?.provisionRequirements.workerAgents || 1;
      await setProvisionRequirements(
        agentClusterInstall,
        Math.max(0, workerCount - 1),
        masterCount,
      );
    }

    const patches: Patch[] = [];
    appendPatch(patches, '/spec/clusterDeploymentName', null, agent.spec.clusterDeploymentName);
    appendPatch(patches, '/spec/role', '', agent.spec.role);
    await k8sPatch({
      model: AgentModel,
      resource: agent,
      data: patches,
    });
  }
};

export const getInfraEnvNMStates = (
  nmStateConfigs: NMStateK8sResource[] = [],
  infraEnv?: InfraEnvK8sResource,
) =>
  nmStateConfigs.filter((nmStateConfig) => {
    if (!Object.keys(infraEnv?.spec?.nmStateConfigLabelSelector?.matchLabels || {}).length) {
      return false;
    }
    return isMatch(
      nmStateConfig.metadata?.labels || {},
      infraEnv?.spec?.nmStateConfigLabelSelector?.matchLabels || {},
    );
  });

export const isBMPlatform = (infrastructure?: InfrastructureK8sResource) =>
  ['BareMetal', 'None', 'OpenStack', 'VSphere'].includes(infrastructure?.status?.platform || '');
