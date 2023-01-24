import React from 'react';
import { saveAs } from 'file-saver';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { canDownloadKubeconfig } from '../hosts/utils';
import { useAlerts } from '../AlertsContextProvider';
import { Cluster } from '../../api/types';
/* eslint-disable no-restricted-imports */
import { ocmClient } from '../../../ocm/api/axiosClient';
import { getApiErrorMessage, handleApiError } from '../../../ocm/api/utils';
import ClustersAPI from '../../../ocm/services/apis/ClustersAPI';
/* eslint-enable no-restricted-imports */
import { AxiosResponseHeaders } from 'axios';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { TFunction } from 'i18next';

type KubeconfigDownloadProps = {
  clusterId: Cluster['id'];
  status: Cluster['status'];
  id?: string;
  handleDownload?: () => void;
};

const getKubeconfigFileName = (
  headers:
    | AxiosResponseHeaders
    | Partial<Record<string, string> & { 'set-cookie'?: string[] | undefined }>,
) => {
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
