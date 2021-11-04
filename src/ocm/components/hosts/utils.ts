import { saveAs } from 'file-saver';
import { AlertsContextType, Cluster, ClusterUpdateParams, Host } from '../../../common';

import { ocmClient, handleApiError, getErrorMessage } from '../../api';
import { updateCluster } from '../../reducers/clusters';
import { ClustersService } from '../../services';
import ClustersAPI from '../../services/apis/ClustersAPI';

export const downloadHostInstallationLogs = async (
  addAlert: AlertsContextType['addAlert'],
  host: Host,
) => {
  try {
    if (!host.clusterId) {
      throw new Error(
        `Cannot download logs for host ${host.id}. Missing clusterId field value in host.`,
      );
    }
    if (ocmClient) {
      const { data } = await ClustersAPI.GetPresignedForClusterFiles({
        clusterId: host.clusterId,
        fileName: 'logs',
        hostId: host.id,
        logsType: 'host',
      });
      saveAs(data.url);
    } else {
      const { data, fileName } = await ClustersService.downloadLogs(host.clusterId, host.id);
      saveAs(data, fileName);
    }
  } catch (e) {
    handleApiError(e, async (e) => {
      addAlert({ title: 'Could not download host logs.', message: getErrorMessage(e) });
    });
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
