import React from 'react';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { saveAs } from 'file-saver';
import { AxiosResponseHeaders } from 'axios';
import { TFunction } from 'i18next';
import { canDownloadKubeconfig } from '../hosts';
import { useAlerts } from '../AlertsContextProvider';
import { Cluster } from '../../api';
import { getApiErrorMessage } from '../../utils';
import { useTranslation } from '../../hooks/use-translation-wrapper';

/* eslint-disable no-restricted-imports */
import { ocmClient, handleApiError } from '../../../ocm/api';
import ClustersAPI from '../../../ocm/services/apis/ClustersAPI';
/* eslint-enable no-restricted-imports */

type KubeconfigDownloadProps = {
  clusterId: Cluster['id'];
  status: Cluster['status'];
  id?: string;
  handleDownload?: () => void;
};

const getKubeconfigFileName = (headers: AxiosResponseHeaders) => {
  const fileNameMatch =
    headers['content-disposition'] && headers['content-disposition'].match(/filename=".*"/);
  return fileNameMatch ? fileNameMatch[0].slice(10, -1) : 'kubeconfig';
};

const KubeconfigDownload: React.FC<KubeconfigDownloadProps> = ({
  clusterId,
  status,
  id,
  handleDownload,
}) => {
  const { addAlert } = useAlerts();

  const download = React.useCallback(
    async (clusterId: Cluster['id'], t: TFunction) => {
      try {
        if (ocmClient) {
          const { data } = await ClustersAPI.getPresignedForClusterCredentials({
            clusterId,
            fileName: 'kubeconfig',
          });
          saveAs(data.url);
        } else {
          const response = await ClustersAPI.downloadClusterCredentials(clusterId, 'kubeconfig');
          const fileName = getKubeconfigFileName(response.headers);

          saveAs(response.data, fileName);
        }
      } catch (e) {
        handleApiError(e, (e) => {
          addAlert({
            title: t('ai:Could not download kubeconfig'),
            message: getApiErrorMessage(e),
          });
        });
      }
    },
    [addAlert],
  );
  const { t } = useTranslation();
  return (
    <Button
      variant={ButtonVariant.secondary}
      onClick={handleDownload || (() => download(clusterId, t))}
      isDisabled={!canDownloadKubeconfig(status)}
      id={id}
      data-testid={id}
    >
      Download kubeconfig
    </Button>
  );
};

export default KubeconfigDownload;
