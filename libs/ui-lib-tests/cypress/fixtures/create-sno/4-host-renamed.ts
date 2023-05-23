/* eslint-disable @typescript-eslint/naming-convention */

import { clusterValidationsInfo } from '../cluster/validation-info-host-renamed';

const hostRenamedBuilder = (baseCluster) => {
  return {
    ...baseCluster,
    e2e_mock_source: '4-node-renamed',
    status: 'insufficient',
    validations_info: JSON.stringify(clusterValidationsInfo),
    feature_usage: JSON.stringify({
      ...baseCluster.featureUsage,
      'Requested hostname': {
        data: {
          host_count: 1,
        },
        id: 'REQUESTED_HOSTNAME',
        name: 'Requested hostname',
      },
    }),
  };
};

export { hostRenamedBuilder };
