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
      const { data } = await getPresignedFileUrl(clusterId, 'logs', undefined);
      // TODO(mlibra): Setting of filename here is workaround till https://issues.redhat.com/browse/MGMT-2128 is fixed.The Content-Disposition header should be set.
      const filename = `log_cluster_${clusterId}.tgz`;
      saveAs(data.url, filename);
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
