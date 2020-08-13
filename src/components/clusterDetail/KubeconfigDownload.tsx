import React from 'react';
import { saveAs } from 'file-saver';
import { GridItem, Button, ButtonVariant } from '@patternfly/react-core';
import { downloadClusterFile, getPresignedFileUrl } from '../../api/clusters';
import { Cluster, Presigned } from '../../api/types';
import { canDownloadKubeconfig } from '../hosts/utils';
import { AlertsContext } from '../AlertsContextProvider';
import { getErrorMessage, handleApiError, ocmClient } from '../../api';

type KubeconfigDownloadProps = {
  clusterId: Cluster['id'];
  status: Cluster['status'];
};

const KubeconfigDownload: React.FC<KubeconfigDownloadProps> = ({ clusterId, status }) => {
  const { addAlert } = React.useContext(AlertsContext);

  const download = React.useCallback(
    async (clusterId: Cluster['id'], status: Cluster['status']) => {
      const fileName = status === 'installed' ? 'kubeconfig' : 'kubeconfig-noingress';
      if (ocmClient) {
        try {
          const { data } = await getPresignedFileUrl(clusterId, fileName);
          saveAs(data.url);
        } catch (e) {
          handleApiError<Presigned>(e, async (e) => {
            addAlert({ title: 'Could not download kubeconfig', message: getErrorMessage(e) });
          });
        }
      } else {
        try {
          await downloadClusterFile(clusterId, fileName);
        } catch (e) {
          addAlert({ title: 'Could not download kubeconfig', message: getErrorMessage(e) });
        }
      }
    },
    [addAlert],
  );

  return (
    <GridItem>
      <Button
        variant={ButtonVariant.secondary}
        onClick={() => download(clusterId, status)}
        isDisabled={!canDownloadKubeconfig(status)}
      >
        Download kubeconfig
      </Button>
    </GridItem>
  );
};

export default KubeconfigDownload;
