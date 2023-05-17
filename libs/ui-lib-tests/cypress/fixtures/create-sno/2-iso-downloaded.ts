/* eslint-disable @typescript-eslint/naming-convention */

const connectivityMajorityGroups = {
  IPv4: [],
  IPv6: [],
};

const isoDownloadedClusterBuilder = (baseCluster) => {
  return {
    ...baseCluster,
    e2e_mock_source: '2-iso-downloaded',
    connectivity_majority_groups: JSON.stringify(connectivityMajorityGroups),
    status: 'pending-for-input',
    status_info: 'User input required',
  };
};

export { isoDownloadedClusterBuilder };
