/* eslint-disable @typescript-eslint/naming-convention */

const featureSupport = [
  {
    features: [
      { feature_id: 'SNO', support_level: 'supported' },
      {
        feature_id: 'DUAL_STACK_NETWORKING',
        support_level: 'supported',
      },
      { feature_id: 'VIP_AUTO_ALLOC', support_level: 'dev-preview' },
      {
        feature_id: 'ARM64_ARCHITECTURE',
        support_level: 'unsupported',
      },
      {
        feature_id: 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
        support_level: 'unsupported',
      },
      { feature_id: 'SINGLE_NODE_EXPANSION', support_level: 'unsupported' },
      {
        feature_id: 'LVM',
        support_level: 'unsupported',
      },
      { feature_id: 'MULTIARCH_RELEASE_IMAGE', support_level: 'unsupported' },
      {
        feature_id: 'NUTANIX_INTEGRATION',
        support_level: 'unsupported',
      },
      { feature_id: 'DUAL_STACK_VIPS', support_level: 'unsupported' },
    ],
    openshift_version: '4.9',
  },
  {
    features: [
      { feature_id: 'SNO', support_level: 'supported' },
      {
        feature_id: 'ARM64_ARCHITECTURE',
        support_level: 'supported',
      },
      { feature_id: 'DUAL_STACK_NETWORKING', support_level: 'supported' },
      {
        feature_id: 'VIP_AUTO_ALLOC',
        support_level: 'dev-preview',
      },
      {
        feature_id: 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
        support_level: 'unsupported',
      },
      { feature_id: 'SINGLE_NODE_EXPANSION', support_level: 'unsupported' },
      {
        feature_id: 'LVM',
        support_level: 'unsupported',
      },
      { feature_id: 'MULTIARCH_RELEASE_IMAGE', support_level: 'unsupported' },
      {
        feature_id: 'NUTANIX_INTEGRATION',
        support_level: 'unsupported',
      },
      { feature_id: 'DUAL_STACK_VIPS', support_level: 'unsupported' },
    ],
    openshift_version: '4.10',
  },
  {
    features: [
      { feature_id: 'SNO', support_level: 'supported' },
      {
        feature_id: 'ARM64_ARCHITECTURE',
        support_level: 'supported',
      },
      {
        feature_id: 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
        support_level: 'supported',
      },
      { feature_id: 'SINGLE_NODE_EXPANSION', support_level: 'supported' },
      {
        feature_id: 'DUAL_STACK_NETWORKING',
        support_level: 'supported',
      },
      { feature_id: 'MULTIARCH_RELEASE_IMAGE', support_level: 'tech-preview' },
      {
        feature_id: 'VIP_AUTO_ALLOC',
        support_level: 'dev-preview',
      },
      { feature_id: 'LVM', support_level: 'dev-preview' },
      {
        feature_id: 'NUTANIX_INTEGRATION',
        support_level: 'dev-preview',
      },
      { feature_id: 'DUAL_STACK_VIPS', support_level: 'unsupported' },
    ],
    openshift_version: '4.11',
  },
  {
    features: [
      { feature_id: 'SNO', support_level: 'supported' },
      {
        feature_id: 'ARM64_ARCHITECTURE',
        support_level: 'supported',
      },
      {
        feature_id: 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
        support_level: 'supported',
      },
      { feature_id: 'SINGLE_NODE_EXPANSION', support_level: 'supported' },
      {
        feature_id: 'LVM',
        support_level: 'supported',
      },
      { feature_id: 'DUAL_STACK_NETWORKING', support_level: 'supported' },
      {
        feature_id: 'NUTANIX_INTEGRATION',
        support_level: 'supported',
      },
      { feature_id: 'DUAL_STACK_VIPS', support_level: 'supported' },
      {
        feature_id: 'MULTIARCH_RELEASE_IMAGE',
        support_level: 'tech-preview',
      },
      { feature_id: 'VIP_AUTO_ALLOC', support_level: 'dev-preview' },
    ],
    openshift_version: '4.12',
  },
  {
    features: [
      { feature_id: 'SNO', support_level: 'supported' },
      {
        feature_id: 'ARM64_ARCHITECTURE',
        support_level: 'supported',
      },
      {
        feature_id: 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
        support_level: 'supported',
      },
      { feature_id: 'SINGLE_NODE_EXPANSION', support_level: 'supported' },
      {
        feature_id: 'LVM',
        support_level: 'supported',
      },
      { feature_id: 'DUAL_STACK_NETWORKING', support_level: 'supported' },
      {
        feature_id: 'NUTANIX_INTEGRATION',
        support_level: 'supported',
      },
      { feature_id: 'DUAL_STACK_VIPS', support_level: 'supported' },
      {
        feature_id: 'MULTIARCH_RELEASE_IMAGE',
        support_level: 'tech-preview',
      },
      { feature_id: 'VIP_AUTO_ALLOC', support_level: 'dev-preview' },
    ],
    openshift_version: '4.13',
  },
];
export default featureSupport;
