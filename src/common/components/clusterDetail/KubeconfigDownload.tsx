import React from 'react';
import { saveAs } from 'file-saver';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { getPresignedFileUrl, getClusterFileDownload } from '../../../ocm/api/clusters';
import { canDownloadKubeconfig } from '../hosts/utils';
import { useAlerts } from '../AlertsContextProvider';
import { Cluster, Presigned } from '../../api/types';
import { ocmClient } from '../../../ocm/api/axiosClient';
import { getErrorMessage, handleApiError } from '../../../ocm/api/utils';

type KubeconfigDownloadProps = {
  clusterId: Cluster['id'];
  status: Cluster['status'];
  id?: string;
  handleDownload?: () => void;
};

const KubeconfigDownload: React.FC<KubeconfigDownloadProps> = ({
  clusterId,
  status,
  id,
  handleDownload,
}) => {
  const { addAlert } = useAlerts();

  const download = React.useCallback(
    async (clusterId: Cluster['id'], status: Cluster['status']) => {
      const fileName = status === 'installed' ? 'kubeconfig' : 'kubeconfig-noingress';
      if (ocmClient) {
        try {
          const { data } = await getPresignedFileUrl({ clusterId, fileName });
          saveAs(data.url);
        } catch (e) {
          handleApiError(e, async (e) => {
            addAlert({ title: 'Could not download kubeconfig', message: getErrorMessage(e) });
          });
        }
      } else {
        try {
          const response = await getClusterFileDownload(clusterId, fileName);
          const contentHeader = response.headers.contentDisposition;
          const name = contentHeader?.match(/filename="(.+)"/)?.[1];
          saveAs(response.data, name);
        } catch (e) {
          handleApiError(e, async (e) => {
            addAlert({ title: 'Could not download kubeconfig', message: getErrorMessage(e) });
          });
        }
      }
    },
    [addAlert],
  );

  return (
    <Button
      variant={ButtonVariant.secondary}
      onClick={handleDownload || (() => download(clusterId, status))}
      isDisabled={!canDownloadKubeconfig(status)}
      id={id}
      data-testid={id}
    >
      Download kubeconfig
    </Button>
  );
};

export default KubeconfigDownload;
