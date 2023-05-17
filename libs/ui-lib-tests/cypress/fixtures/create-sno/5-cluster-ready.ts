/* eslint-disable @typescript-eslint/naming-convention */

import { clusterValidationsInfo } from '../cluster/validation-info-cluster-ready';

const clusterReadyBuilder = (baseCluster) => {
  return {
    ...baseCluster,
    e2e_mock_source: '5-cluster-ready',
    status: 'ready',
    status_info: 'Cluster ready to be installed',
    validations_info: JSON.stringify(clusterValidationsInfo),
  };
};

export { clusterReadyBuilder };
