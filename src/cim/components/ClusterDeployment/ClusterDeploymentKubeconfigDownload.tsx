import React from 'react';
import { saveAs } from 'file-saver';
import KubeconfigDownload from '../../../common/components/clusterDetail/KubeconfigDownload';
import { AgentClusterInstallK8sResource } from '../../types/k8s/agent-cluster-install';
import { ClusterDeploymentK8sResource } from '../../types/k8s/cluster-deployment';
import { getClusterStatus } from '../helpers/status';
import { FetchSecret } from './types';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type ClusterDeploymentKubeconfigDownloadProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  agentClusterInstall: AgentClusterInstallK8sResource;
  fetchSecret: FetchSecret;
};

const ClusterDeploymentKubeconfigDownload = ({
  clusterDeployment,
  agentClusterInstall,
  fetchSecret,
}: ClusterDeploymentKubeconfigDownloadProps) => {
  const [clusterStatus] = getClusterStatus(agentClusterInstall);
  const { t } = useTranslation();
  const handleKubeconfigDownload = async () => {
    const kubeconfigSecretName =
      agentClusterInstall.spec?.clusterMetadata?.adminKubeconfigSecretRef?.name;
    const kubeconfigSecretNamespace = clusterDeployment.metadata?.namespace;
    if (kubeconfigSecretName && kubeconfigSecretNamespace) {
      try {
        const kubeconfigSecret = await fetchSecret(kubeconfigSecretName, kubeconfigSecretNamespace);
        const kubeconfig = kubeconfigSecret.data?.kubeconfig;

        if (!kubeconfig) throw new Error(t('ai:Kubeconfig is empty.'));

        const blob = new Blob([atob(kubeconfig)], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'kubeconfig.yaml');
      } catch (e) {
        console.error('Failed to fetch kubeconfig secret.', e);
      }
    }
  };

  return (
    <KubeconfigDownload
      handleDownload={handleKubeconfigDownload}
      clusterId={clusterDeployment.metadata?.uid || ''}
      status={clusterStatus}
    />
  );
};

export default ClusterDeploymentKubeconfigDownload;
