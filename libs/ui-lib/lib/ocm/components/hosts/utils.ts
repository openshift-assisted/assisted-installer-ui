import { saveAs } from 'file-saver';
import type { AlertsContextType } from '../../../common';

import { isInOcm, handleApiError, getApiErrorMessage } from '../../api';
import { updateCluster } from '../../store/slices/current-cluster/slice';
import { ClustersService } from '../../services';
import ClustersAPI from '../../../common/api/assisted-service/ClustersAPI';
import { stringToJSON } from '../../../common/utils';
import {
  Cluster,
  Host,
  Inventory,
  V2ClusterUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';

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
    if (isInOcm) {
      const { data } = await ClustersAPI.getPresignedForClusterFiles({
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
    handleApiError(e, (e) => {
      addAlert({ title: 'Could not download host logs.', message: getApiErrorMessage(e) });
    });
  }
};

export const onAdditionalNtpSourceAction = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatch: (payload: any) => void,
  cluster: Cluster,
  additionalNtpSource: string,
  onError: (message: string) => void,
) => {
  try {
    const values: V2ClusterUpdateParams = {
      additionalNtpSource,
    };

    const { data } = await ClustersService.update(cluster.id, cluster.tags, values);
    dispatch(updateCluster(data));
  } catch (e) {
    handleApiError(e, () => onError(getApiErrorMessage(e)));
  }
};

export const isAHostVM = (hosts: Host[]) =>
  hosts.some((host) => {
    const inventory = stringToJSON<Inventory>(host.inventory || '') || {};
    return inventory.systemVendor?.virtual;
  });
