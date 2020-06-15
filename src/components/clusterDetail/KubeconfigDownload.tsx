import React from 'react';
import { saveAs } from 'file-saver';
import { GridItem, Button, ButtonVariant } from '@patternfly/react-core';
import { getClusterFileURL, getClusterKubeconfigURL } from '../../api/clusters';
import { Cluster } from '../../api/types';

type KubeconfigDownloadProps = {
  clusterId: Cluster['id'];
  status: Cluster['status'];
};

const getUrl = (clusterId: Cluster['id'], status: Cluster['status']) =>
  status === 'installed'
    ? getClusterKubeconfigURL(clusterId)
    : getClusterFileURL(clusterId, 'kubeconfig-noingress');

const KubeconfigDownload: React.FC<KubeconfigDownloadProps> = ({ clusterId, status }) => {
  return (
    <GridItem>
      <Button variant={ButtonVariant.secondary} onClick={() => saveAs(getUrl(clusterId, status))}>
        Download kubeconfig
      </Button>
    </GridItem>
  );
};

export default KubeconfigDownload;
