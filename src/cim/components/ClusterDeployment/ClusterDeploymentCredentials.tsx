import React from 'react';
import ClusterCredentials from '../../../common/components/clusterDetail/ClusterCredentials';
import { AgentK8sResource } from '../../types/k8s/agent';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { ClusterDeploymentK8sResource } from '../../types/k8s/cluster-deployment';
import { getAICluster } from '../helpers/toAssisted';
import { FetchSecret } from './types';

type ClusterDeploymentCredentialsProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  consoleUrl: string;
  fetchSecret: FetchSecret;
};

const ClusterDeploymentCredentials = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  consoleUrl,
  fetchSecret,
}: ClusterDeploymentCredentialsProps) => {
  const [credentials, setCredentials] = React.useState({});

  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents });

  React.useEffect(() => {
    const fetchCredentials = async () => {
      const adminPasswordSecretRefName =
        agentClusterInstall.spec?.clusterMetadata?.adminPasswordSecretRef?.name;
      const namespace = clusterDeployment.metadata?.namespace;

      if (adminPasswordSecretRefName && namespace) {
        try {
          const secret = await fetchSecret(adminPasswordSecretRefName, namespace);
          // const secret = await k8sGet(SecretModel, adminPasswordSecretRefName, namespace);
          setCredentials({
            username: atob(secret?.data?.username || ''),
            password: atob(secret?.data?.password || ''),
          });
        } catch (e) {
          console.error('Failed to fetch adminPasswordSecret secret.', e);
        }
      }
    };

    fetchCredentials();
  }, [agentClusterInstall, fetchSecret, clusterDeployment.metadata]);

  return <ClusterCredentials cluster={cluster} credentials={{ ...credentials, consoleUrl }} />;
};

export default ClusterDeploymentCredentials;
