/* eslint-disable @typescript-eslint/naming-convention */

const featureSupport = [
  {
    features: [
      {
        feature_id: 'VIP_AUTO_ALLOC',
        support_level: 'dev-preview',
      },
      {
        feature_id: 'SNO',
        support_level: 'unsupported',
      },
      {
        feature_id: 'ARM64_ARCHITECTURE',
        support_level: 'unsupported',
      },
      {
        feature_id: 'CLUSTER_MANAGED_NETWORKING_WITH_VMS',
        support_level: 'unsupported',
      },
    ],
    openshift_version: '4.6',
  },
  {
    features: [
      {
        feature_id: 'VIP_AUTO_ALLOC',
        support_level: 'dev-preview',
      },
      {
        feature_id: 'SNO',
        support_level: 'dev-preview',
      },
      {
        feature_id: 'ARM64_ARCHITECTURE',
        support_level: 'unsupported',
      },
      {
        feature_id: 'CLUSTER_MANAGED_NETWORKING_WITH_VMS',
        support_level: 'unsupported',
      },
    ],
    openshift_version: '4.8',
  },
  {
    features: [
      {
        feature_id: 'SNO',
        support_level: 'supported',
      },
      {
        feature_id: 'VIP_AUTO_ALLOC',
        support_level: 'dev-preview',
      },
      {
        feature_id: 'ARM64_ARCHITECTURE',
        support_level: 'unsupported',
      },
      {
        feature_id: 'CLUSTER_MANAGED_NETWORKING_WITH_VMS',
        support_level: 'unsupported',
      },
    ],
    openshift_version: '4.9',
  },
  {
    features: [
      {
        feature_id: 'SNO',
        support_level: 'supported',
      },
      {
        feature_id: 'ARM64_ARCHITECTURE',
        support_level: 'supported',
      },
      {
        feature_id: 'VIP_AUTO_ALLOC',
        support_level: 'dev-preview',
      },
      {
        feature_id: 'CLUSTER_MANAGED_NETWORKING_WITH_VMS',
        support_level: 'unsupported',
      },
    ],
    openshift_version: '4.10',
  },
];

export default featureSupport;
