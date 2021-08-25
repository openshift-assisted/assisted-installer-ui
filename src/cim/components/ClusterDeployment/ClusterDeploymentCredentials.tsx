import React from 'react';
import ClusterCredentials from '../../../common/components/clusterDetail/ClusterCredentials';
import { AgentK8sResource } from '../../types/k8s/agent';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { ClusterDeploymentK8sResource } from '../../types/k8s/cluster-deployment';
import { getAICluster } from '../helpers/toAssisted';

type ClusterDeploymentCredentialsProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  consoleUrl: string;
  fetchCredentials: (setCredentials: React.Dispatch<React.SetStateAction<{}>>) => void;
};

const ClusterDeploymentCredentials = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  consoleUrl,
  fetchCredentials,
}: ClusterDeploymentCredentialsProps) => {
  const [credentials, setCredentials] = React.useState({});
  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents });

  React.useEffect(() => {
    fetchCredentials(setCredentials);
  }, [agentClusterInstall, fetchCredentials]);

  return <ClusterCredentials cluster={cluster} credentials={{ ...credentials, consoleUrl }} />;
};

export default ClusterDeploymentCredentials;
