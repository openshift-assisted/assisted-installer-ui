import React from 'react';
import ClusterProgress from '../../../common/components/clusterDetail/ClusterProgress';
import { AgentK8sResource } from '../../types/k8s/agent';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { ClusterDeploymentK8sResource } from '../../types/k8s/cluster-deployment';
import { getAgentRole } from '../helpers/agents';
import { EventListFetchProps } from '../../../common';
import { getAICluster } from '../helpers/toAssisted';

// NOTE: based host stages defined in https://github.com/openshift/assisted-service/blob/master/internal/host/host.go
// TODO(jtomasek): Use this until agent resource does not expose host.progressStages array
const getAgentProgressStages = (agent: AgentK8sResource) => {
  const isBootstrap = agent.status?.bootstrap;
  const role = getAgentRole(agent);

  const bootstrapHostStages = [
    'Starting installation',
    'Installing',
    'Writing image to disk',
    'Waiting for control plane',
    'Waiting for bootkube',
    'Waiting for controller',
    'Rebooting',
    'Configuring',
    'Joined',
    'Done',
  ];

  const masterHostStages = [
    'Starting installation',
    'Installing',
    'Writing image to disk',
    'Rebooting',
    'Configuring',
    'Joined',
    'Done',
  ];

  const workerHostStages = [
    'Starting installation',
    'Installing',
    'Writing image to disk',
    'Waiting for control plane',
    'Rebooting',
    'Waiting for ignition',
    'Configuring',
    'Joined',
    'Done',
  ];

  if (isBootstrap) return bootstrapHostStages;
  if (role === 'master') return masterHostStages;
  if (role === 'worker') return workerHostStages;
  return [];
};

export const getAgentProgress = (agent: AgentK8sResource) =>
  agent.status?.progress || { currentStage: 'Preparing installation', progressInfo: undefined };

export const getAgentProgressStageNumber = (agent: AgentK8sResource) => {
  const stages = getAgentProgressStages(agent);
  const progress = getAgentProgress(agent);
  // TODO(jkilzi): progress cannot be undefined! This condition seems to be redundant.
  if (progress) {
    const currentStage = progress.currentStage;
    return stages.findIndex((s) => currentStage?.match(s)) + 1;
  }
  return 0;
};

const getAgentsProgressPercent = (agents: AgentK8sResource[] = []) => {
  const totalSteps = agents.reduce(
    (steps, agent) => steps + getAgentProgressStages(agent).length,
    0,
  );
  const completedSteps = agents.reduce(
    (steps, agent) => steps + getAgentProgressStageNumber(agent),
    0,
  );
  return totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 100;
};

type ClusterDeploymentProgressProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  onFetchEvents: EventListFetchProps['onFetchEvents'];
};

const ClusterDeploymentProgress = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onFetchEvents,
}: ClusterDeploymentProgressProps) => {
  const agentsProgressPercent = React.useMemo(() => getAgentsProgressPercent(agents), [agents]);

  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents });
  return (
    <ClusterProgress
      totalPercentage={agentsProgressPercent}
      cluster={cluster}
      onFetchEvents={onFetchEvents}
    />
  );
};

export default ClusterDeploymentProgress;
