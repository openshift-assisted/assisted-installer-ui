import React from 'react';
import { Button, ButtonVariant } from '@patternfly/react-core';
import { canDownloadKubeconfig } from '../hosts/utils';
import { useAlerts } from '../AlertsContextProvider';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { isInOcm } from '../../api/axiosClient';
import { getApiErrorMessage, handleApiError } from '../../api/utils';
import ClustersAPI from '../../api/assisted-service/ClustersAPI';
import { AxiosHeaderValue, AxiosHeaders, AxiosResponseHeaders } from 'axios';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { TFunction } from 'i18next';
import { downloadFile } from '../../utils';

type KubeconfigDownloadProps = {
  className?: string;
  clusterId: Cluster['id'];
  status: Cluster['status'];
  id?: string;
  handleDownload?: () => void;
};

const getKubeconfigFileName = (
  headers:
    | AxiosResponseHeaders
    | Partial<Record<string, string> & { 'set-cookie'?: string[] | undefined }>
    | Partial<
        AxiosHeaders & {
          Server: AxiosHeaderValue;
          'Content-Type': AxiosHeaderValue;
          'Content-Length': AxiosHeaderValue;
          'Cache-Control': AxiosHeaderValue;
          'Content-Encoding': AxiosHeaderValue;
        }
      >,
) => {
  const fileNameMatch =
    (headers['content-disposition'] as string) &&
    (headers['content-disposition'] as string).match(/filename=".*"/);
  return fileNameMatch ? fileNameMatch[0].slice(10, -1) : 'kubeconfig';
};

const KubeconfigDownload: React.FC<KubeconfigDownloadProps> = ({
  clusterId,
  status,
  id,
  handleDownload,
  className,
}) => {
  const { addAlert } = useAlerts();

  const download = React.useCallback(
    async (clusterId: Cluster['id'], t: TFunction) => {
      try {
        if (isInOcm) {
          const { data } = await ClustersAPI.getPresignedForClusterCredentials({
            clusterId,
            fileName: 'kubeconfig',
          });
          downloadFile(data.url);
        } else {
          const response = await ClustersAPI.downloadClusterCredentials(clusterId, 'kubeconfig');
          const fileName = getKubeconfigFileName(response.headers);

          downloadFile('', response.data, fileName);
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
      className={className}
      onClick={handleDownload || (() => download(clusterId, t))}
      isDisabled={!canDownloadKubeconfig(status)}
      id={id}
      data-testid={id}
    >
      {t('ai:Download kubeconfig')}
    </Button>
  );
};

export default KubeconfigDownload;
