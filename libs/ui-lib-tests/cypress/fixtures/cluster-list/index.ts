import { baseCluster } from '../cluster/base-cluster';

const clusterTemplate = baseCluster();
const fakeClusterId = 'FAKE-ID';

const fakeCluster = {
  ...clusterTemplate,
  name: 'cluster-1',
  id: fakeClusterId,
  href: `/api/assisted-install/v2/clusters/${fakeClusterId}`,
};

const addedCluster = () => ({
  ...clusterTemplate,
  name: Cypress.env('CLUSTER_NAME'),
});

const initialList = [fakeCluster];

const updatedList = () => [addedCluster(), fakeCluster];

export { initialList, updatedList };
