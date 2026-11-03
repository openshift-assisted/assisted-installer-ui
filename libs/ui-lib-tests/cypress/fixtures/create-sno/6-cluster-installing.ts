/* eslint-disable @typescript-eslint/naming-convention */

const clusterPreparingForInstallationBuilder = (baseCluster) => {
  return {
    ...baseCluster,
    e2e_mock_source: '6-cluster-preparing',
    status: 'preparing-for-installation',
    status_info: 'Preparing cluster for installation',
    install_started_at: '2026-11-03T10:43:46.598Z',
    progress: {
      finalizing_stage_started_at: '0001-01-01T00:00:00.000Z',
    },
  };
};

const clusterInstallingBuilder = (baseCluster) => {
  return {
    ...baseCluster,
    e2e_mock_source: '6-cluster-installing',
    status: 'installing',
    status_info: 'Installation in progress',
    install_started_at: '2026-11-03T10:43:46.598Z',
    progress: {
      finalizing_stage_started_at: '0001-01-01T00:00:00.000Z',
      preparing_for_installation_stage_percentage: 100,
      total_percentage: 10,
    },
  };
};

export { clusterPreparingForInstallationBuilder, clusterInstallingBuilder };
