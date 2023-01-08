import React from 'react';
import { ClusterCredentials, Credentials } from '../../../common';
import { AgentK8sResource } from '../../types/k8s/agent';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { ClusterDeploymentK8sResource } from '../../types/k8s/cluster-deployment';
import { getAICluster } from '../helpers/toAssisted';
import { FetchSecret } from './types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type ClusterDeploymentCredentialsProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  agents: AgentK8sResource[];
  consoleUrl?: string;
  fetchSecret: FetchSecret;
};

const ClusterDeploymentCredentials = ({
  clusterDeployment,
  agentClusterInstall,
  agents,
  consoleUrl,
  fetchSecret,
}: ClusterDeploymentCredentialsProps) => {
  const [credentials, setCredentials] = React.useState<Credentials | undefined>();
  const [isError, setIsError] = React.useState(false);

  const cluster = getAICluster({ clusterDeployment, agentClusterInstall, agents });

  const adminPasswordSecretRefName =
    agentClusterInstall.spec?.clusterMetadata?.adminPasswordSecretRef?.name;
  const namespace = clusterDeployment.metadata?.namespace;
  const { t } = useTranslation();
  React.useEffect(() => {
    const fetchCredentials = async () => {
      if (adminPasswordSecretRefName && namespace) {
        try {
          const secret = await fetchSecret(adminPasswordSecretRefName, namespace);
          setCredentials({
            username: atob(secret?.data?.username || ''),
            password: atob(secret?.data?.password || ''),
            consoleUrl,
          });
        } catch (e) {
          setIsError(true);
          console.error(t('ai:Failed to fetch adminPasswordSecret secret.'), e);
        }
      }
    };

    void fetchCredentials();
  }, [adminPasswordSecretRefName, namespace, fetchSecret, consoleUrl, t]);

  return <ClusterCredentials cluster={cluster} credentials={credentials} error={isError} />;
};

export default ClusterDeploymentCredentials;
