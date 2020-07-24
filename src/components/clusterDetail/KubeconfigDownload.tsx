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
  const [url, setURL] = React.useState<string>();
  React.useEffect(() => {
    getUrl(clusterId, status).then(setURL);
  }, [clusterId, status]);
  return (
    <GridItem>
      <Button disabled={!url} variant={ButtonVariant.secondary} onClick={() => url && saveAs(url)}>
        Download kubeconfig
      </Button>
    </GridItem>
  );
};

export default KubeconfigDownload;
