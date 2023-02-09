import React from 'react';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { Cluster } from '../../api';
import { canDownloadKubeconfig } from '../hosts';
import { useTranslation } from '../../hooks/use-translation-wrapper';

type KubeconfigDownloadProps = {
  className?: string;
  status: Cluster['status'];
  id?: string;
  handleDownload: () => void;
};

const KubeconfigDownload = ({ status, id, handleDownload, className }: KubeconfigDownloadProps) => {
  const { t } = useTranslation();
  return (
    <Button
      variant={ButtonVariant.secondary}
      className={className}
      onClick={handleDownload}
      isDisabled={!canDownloadKubeconfig(status)}
      id={id}
      data-testid={id}
    >
      {t('ai:Download kubeconfig')}
    </Button>
  );
};

export default KubeconfigDownload;
