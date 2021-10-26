import React from 'react';
import ClusterProgress from '../../../common/components/clusterDetail/ClusterProgress';
import { AgentK8sResource } from '../../types/k8s/agent';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { ClusterDeploymentK8sResource } from '../../types/k8s/cluster-deployment';
import { getAgentProgress, getAgentProgressStages } from '../helpers/agents';
import { EventListFetchProps } from '../../../common';
import { getAICluster } from '../helpers/toAssisted';

export const getAgentProgressStageNumber = (agent: AgentK8sResource) => {
  const stages = getAgentProgressStages(agent);
  const progress = getAgentProgress(agent);
  const currentStage = progress?.currentStage;
  return stages.findIndex((s) => currentStage?.match(s)) + 1;
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
  fallbackEventsURL?: string;
};

const ClusterDeploymentProgress = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  onFetchEvents,
  fallbackEventsURL,
}: ClusterDeploymentProgressProps) => {
  const agentsProgressPercent = React.useMemo(() => getAgentsProgressPercent(agents), [agents]);

  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents });
  return (
    <ClusterProgress
      totalPercentage={agentsProgressPercent}
      cluster={cluster}
      onFetchEvents={onFetchEvents}
      fallbackEventsURL={fallbackEventsURL}
    />
  );
};

export default ClusterDeploymentProgress;
