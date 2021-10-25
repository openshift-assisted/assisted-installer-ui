import { saveAs } from 'file-saver';
import { AlertsContextType, Cluster, ClusterUpdateParams, Host } from '../../../common';

import { ocmClient, handleApiError, getErrorMessage } from '../../api';
import { updateCluster } from '../../reducers/clusters';
import ClustersAPI from '../../services/apis/ClustersAPI';

export const downloadHostInstallationLogs = async (
  addAlert: AlertsContextType['addAlert'],
  host: Host,
) => {
  if (ocmClient) {
    try {
      const { data } = await ClustersAPI.getPresignedForClusterCredentials({
        clusterId: host.clusterId || 'UNKNOWN_CLUSTER',
        fileName: 'logs',
        hostId: host.id,
        logsType: 'host',
      });
      saveAs(data.url);
    } catch (e) {
      handleApiError(e, async (e) => {
        addAlert({ title: 'Could not download host logs.', message: getErrorMessage(e) });
      });
    }
  } else {
    const response = await ClustersAPI.downloadHostLogs(host.id, host.clusterId);
    const contentHeader = response.headers.contentDisposition;
    const name = contentHeader?.match(/filename="(.+)"/)?.[1];
    saveAs(response.data, name);
  }
};

export const onAdditionalNtpSourceAction = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: (payload: any) => void,
  clusterId: Cluster['id'],
  additionalNtpSource: string,
  onError: (message: string) => void,
) => {
  try {
    const values: ClusterUpdateParams = {
      additionalNtpSource,
    };

    const { data } = await ClustersAPI.update(clusterId, values);
    dispatch(updateCluster(data));
  } catch (e) {
    handleApiError(e, () => onError(getErrorMessage(e)));
  }
};
