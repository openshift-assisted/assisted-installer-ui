import React from 'react';
import ClusterProgress from '../../../common/components/clusterDetail/ClusterProgress';
import { EventListFetchProps } from '../../../common/types/events';
import { AgentK8sResource } from '../../types/k8s/agent';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { ClusterDeploymentK8sResource } from '../../types/k8s/cluster-deployment';
import { getAICluster } from '../helpers/toAssisted';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAgentProgressStages = (agent: AgentK8sResource) => {
  // TODO(jtomasek): replace this hardcoded list by property from the agent once available
  return [
    'Starting installation',
    'Waiting for control plane',
    'Installing',
    'Writing image to disk',
    'Rebooting',
    'Waiting for ignition',
    'Configuring',
    'Joined',
    'Done',
  ];
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
