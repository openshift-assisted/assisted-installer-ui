import { getBaseCluster, getBaseInfraEnv } from './1-cluster-created';
import { dualStackSpecificHostsConfigured, networkWideConfigured } from './static-network-config';

const initialCluster = getBaseCluster({ name: 'ai-e2e-static-ip' });
const initialInfraEnv = getBaseInfraEnv();

const createStaticIpFixtureMapping = {
  clusters: {
    default: initialCluster,
  },
  infraEnvs: {
    default: initialInfraEnv,
    STATIC_IP_NETWORK_WIDE_CONFIGURED: {
      ...initialInfraEnv,
      static_network_config: JSON.stringify(networkWideConfigured),
    },
    STATIC_IP_HOST_SPECIFIC_CONFIGURED: {
      ...initialInfraEnv,
      static_network_config: JSON.stringify(dualStackSpecificHostsConfigured),
    },
  },
};
export default createStaticIpFixtureMapping;
