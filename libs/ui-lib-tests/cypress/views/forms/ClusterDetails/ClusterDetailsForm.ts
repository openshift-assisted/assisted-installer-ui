import { BaseDomain, ClusterName, OpenshiftVersion, PullSecret } from './Fields';

const selector = '#wizard-cluster-details__form';
export const ClusterDetailsForm = {
  clusterName: () => {
    return ClusterName(selector);
  },
  baseDomain: () => {
    return BaseDomain(selector);
  },
  openshiftVersion: () => {
    return OpenshiftVersion(selector);
  },
  pullSecret: () => {
    return PullSecret(selector);
  },

  // sno
  // cpuArchitecture
  // platformIntegration
  // customManifests
  // hostNetworkConfiguration
  // diskEncryption
};
