import { Cluster, ImageInfo } from '../../../../common/api/types';
import MockImageInfoGenerator from './MockImageInfoGenerator';
import faker from 'faker';

const MockClusterGenerator = {
  generate(overrides: Partial<Cluster>): Cluster {
    const id = faker.datatype.uuid();
    return {
      href: `/api/assisted-install/v1/clusters/${id}`,
      id,
      imageInfo: MockImageInfoGenerator.generate({}),
      kind: 'Cluster',
      status: 'ready',
      statusInfo: "Here displays the cluster's status info",
      ...overrides,
    };
  },
};

export default MockClusterGenerator;
