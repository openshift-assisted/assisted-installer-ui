import React from 'react';
import { GridItem, Button, ButtonVariant } from '@patternfly/react-core';
import { downloadClusterFile, downloadClusterKubeconfig } from '../../api/clusters';
import { Cluster } from '../../api/types';
import { canDownloadKubeconfig } from '../hosts/utils';
import { AlertsContext } from '../AlertsContextProvider';
import { getErrorMessage } from '../../api';

type KubeconfigDownloadProps = {
  clusterId: Cluster['id'];
  status: Cluster['status'];
};

const download = (clusterId: Cluster['id'], status: Cluster['status']) =>
  status === 'installed'
    ? downloadClusterKubeconfig(clusterId)
    : downloadClusterFile(clusterId, 'kubeconfig-noingress');

const KubeconfigDownload: React.FC<KubeconfigDownloadProps> = ({ clusterId, status }) => {
  const { addAlert } = React.useContext(AlertsContext);
  return (
    <GridItem>
      <Button
        variant={ButtonVariant.secondary}
        onClick={() => {
          try {
            download(clusterId, status);
          } catch (e) {
            addAlert({ title: 'Could not download kubeconfig', message: getErrorMessage(e) });
          }
        }}
        isDisabled={!canDownloadKubeconfig(status)}
      >
        Download kubeconfig
      </Button>
    </GridItem>
  );
};

export default KubeconfigDownload;
