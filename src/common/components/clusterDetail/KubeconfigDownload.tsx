import React from 'react';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { canDownloadKubeconfig } from '../hosts';
import { Cluster } from '../../api';

type KubeconfigDownloadProps = {
  status: Cluster['status'];
  id?: string;
  handleDownload: () => Promise<unknown>;
};

const KubeconfigDownload = ({ id, status, handleDownload }: KubeconfigDownloadProps) => {
  return (
    <Button
      variant={ButtonVariant.secondary}
      onClick={handleDownload}
      isDisabled={!canDownloadKubeconfig(status)}
      id={id}
      data-testid={id}
    >
      Download kubeconfig
    </Button>
  );
};

export default KubeconfigDownload;
