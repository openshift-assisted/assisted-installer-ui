import { saveAs } from 'file-saver';
import {
  ocmClient,
  getPresignedFileUrl,
  handleApiError,
  getErrorMessage,
  getClusterLogsDownloadUrl,
} from '../../api';
import { Presigned } from '../../api/types';
import { AlertsContextType } from '../AlertsContextProvider';

export const downloadClusterInstallationLogs = async (
  addAlert: AlertsContextType['addAlert'],
  clusterId: string,
) => {
  if (ocmClient) {
    try {
      const { data } = await getPresignedFileUrl({
        clusterId,
        fileName: 'logs',
        hostId: undefined,
        logsType: 'all',
      });
      saveAs(data.url);
    } catch (e) {
      handleApiError<Presigned>(e, async (e) => {
        addAlert({
          title: 'Could not download cluster installation logs.',
          message: getErrorMessage(e),
        });
      });
    }
  } else {
    saveAs(getClusterLogsDownloadUrl(clusterId));
  }
};
