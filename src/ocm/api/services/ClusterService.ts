import { AxiosPromise } from 'axios';
import { Cluster } from '../../../common';
import { client } from '../axiosClient';

const listClusters = (): AxiosPromise<Cluster[]> => client.get('/v2/clusters');

const ClusterService = {
  listClusters,
};

export default ClusterService;
