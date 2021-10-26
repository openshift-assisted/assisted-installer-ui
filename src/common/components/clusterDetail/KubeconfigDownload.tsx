import React from 'react';
import { saveAs } from 'file-saver';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { canDownloadKubeconfig } from '../hosts/utils';
import { useAlerts } from '../AlertsContextProvider';
import { Cluster } from '../../api/types';
import { ocmClient } from '../../../ocm/api/axiosClient';
import { getErrorMessage, handleApiError } from '../../../ocm/api/utils';
import ClustersAPI from '../../../ocm/services/apis/ClustersAPI';

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
      try {
        if (ocmClient) {
          const { data } = await ClustersAPI.getPresignedForClusterCredentials({
            clusterId,
            fileName,
          });
          saveAs(data.url, fileName);
        } else {
          const response = await ClustersAPI.downloadClusterCredentials(clusterId, fileName);
          saveAs(response.data, fileName);
        }
      } catch (e) {
        handleApiError(e, async (e) => {
          addAlert({ title: 'Could not download kubeconfig', message: getErrorMessage(e) });
        });
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
