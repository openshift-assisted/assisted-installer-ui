import React from 'react';
import { saveAs } from 'file-saver';
import { HostedClusterK8sResource } from '../types';
import { SecretK8sResource } from '../../../types';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

type HypershiftKubeconfigDownloadProps = {
  hostedCluster: HostedClusterK8sResource;
  fetchSecret: (name: string, namespace: string) => Promise<SecretK8sResource>;
};

const HypershiftKubeconfigDownload = ({
  hostedCluster,
  fetchSecret,
}: HypershiftKubeconfigDownloadProps) => {
  const { t } = useTranslation();
  const kubeconfigSecretName = hostedCluster.status?.customKubeconfig
    ? hostedCluster.status.customKubeconfig?.name
    : hostedCluster.status?.kubeconfig?.name;
  const handleKubeconfigDownload = async () => {
    const kubeconfigSecretNamespace = hostedCluster.metadata?.namespace;

    if (kubeconfigSecretName && kubeconfigSecretNamespace) {
      try {
        const kubeconfigSecret = await fetchSecret(kubeconfigSecretName, kubeconfigSecretNamespace);
        const kubeconfig = kubeconfigSecret.data?.kubeconfig;

        if (!kubeconfig) {
          throw new Error('Kubeconfig is empty.');
        }

        const blob = new Blob([atob(kubeconfig)], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'kubeconfig.yaml');
      } catch (e) {
        // console.error('Failed to fetch kubeconfig secret.', e);
      }
    }
  };

  return (
    <Button
      variant={ButtonVariant.secondary}
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      onClick={handleKubeconfigDownload}
      isDisabled={!kubeconfigSecretName}
    >
      {t('ai:Download kubeconfig')}
    </Button>
  );
};

export default HypershiftKubeconfigDownload;
