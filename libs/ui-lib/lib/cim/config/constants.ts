import { FeatureId, SupportLevel } from '../../common';

type FeatureConfig = {
  featureId: FeatureId;
  supportLevel: SupportLevel;
};

type FeaturesConfig = {
  openshiftVersion: string;
  features: FeatureConfig[];
};

type FeatureSupportLevelsConfig = {
  supportLevels: FeaturesConfig[];
};

// source: https://github.com/openshift/assisted-service/blob/master/internal/featuresupport/support_levels_list.go
export const featureSupportLevelsACM: FeatureSupportLevelsConfig = {
  supportLevels: [
    {
      features: [
        {
          featureId: 'VIP_AUTO_ALLOC',
          supportLevel: 'dev-preview',
        },
        {
          featureId: 'SNO',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'ARM64_ARCHITECTURE',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'SINGLE_NODE_EXPANSION',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'LVM',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'DUAL_STACK_NETWORKING',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'MULTIARCH_RELEASE_IMAGE',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'NUTANIX_INTEGRATION',
          supportLevel: 'unsupported',
        },
      ],
      openshiftVersion: '4.6',
    },
    {
      features: [
        {
          featureId: 'DUAL_STACK_NETWORKING',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'MULTIARCH_RELEASE_IMAGE',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'NUTANIX_INTEGRATION',
          supportLevel: 'unsupported',
        },
      ],
      openshiftVersion: '4.7',
    },
    {
      features: [
        {
          featureId: 'DUAL_STACK_NETWORKING',
          supportLevel: 'supported',
        },
        {
          featureId: 'VIP_AUTO_ALLOC',
          supportLevel: 'dev-preview',
        },
        {
          featureId: 'SNO',
          supportLevel: 'dev-preview',
        },
        {
          featureId: 'ARM64_ARCHITECTURE',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'SINGLE_NODE_EXPANSION',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'LVM',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'MULTIARCH_RELEASE_IMAGE',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'NUTANIX_INTEGRATION',
          supportLevel: 'unsupported',
        },
      ],
      openshiftVersion: '4.8',
    },
    {
      features: [
        {
          featureId: 'SNO',
          supportLevel: 'supported',
        },
        {
          featureId: 'DUAL_STACK_NETWORKING',
          supportLevel: 'supported',
        },
        {
          featureId: 'VIP_AUTO_ALLOC',
          supportLevel: 'dev-preview',
        },
        {
          featureId: 'ARM64_ARCHITECTURE',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'SINGLE_NODE_EXPANSION',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'LVM',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'MULTIARCH_RELEASE_IMAGE',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'NUTANIX_INTEGRATION',
          supportLevel: 'unsupported',
        },
      ],
      openshiftVersion: '4.9',
    },
    {
      features: [
        {
          featureId: 'SNO',
          supportLevel: 'supported',
        },
        {
          featureId: 'ARM64_ARCHITECTURE',
          supportLevel: 'supported',
        },
        {
          featureId: 'DUAL_STACK_NETWORKING',
          supportLevel: 'supported',
        },
        {
          featureId: 'VIP_AUTO_ALLOC',
          supportLevel: 'dev-preview',
        },
        {
          featureId: 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'SINGLE_NODE_EXPANSION',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'LVM',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'MULTIARCH_RELEASE_IMAGE',
          supportLevel: 'unsupported',
        },
        {
          featureId: 'NUTANIX_INTEGRATION',
          supportLevel: 'unsupported',
        },
      ],
      openshiftVersion: '4.10',
    },
    {
      features: [
        {
          featureId: 'SNO',
          supportLevel: 'supported',
        },
        {
          featureId: 'ARM64_ARCHITECTURE',
          supportLevel: 'supported',
        },
        {
          featureId: 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
          supportLevel: 'supported',
        },
        {
          featureId: 'SINGLE_NODE_EXPANSION',
          supportLevel: 'supported',
        },
        {
          featureId: 'DUAL_STACK_NETWORKING',
          supportLevel: 'supported',
        },
        {
          featureId: 'MULTIARCH_RELEASE_IMAGE',
          supportLevel: 'tech-preview',
        },
        {
          featureId: 'VIP_AUTO_ALLOC',
          supportLevel: 'dev-preview',
        },
        {
          featureId: 'LVM',
          supportLevel: 'dev-preview',
        },
        {
          featureId: 'NUTANIX_INTEGRATION',
          supportLevel: 'dev-preview',
        },
      ],
      openshiftVersion: '4.11',
    },
    {
      features: [
        {
          featureId: 'SNO',
          supportLevel: 'supported',
        },
        {
          featureId: 'ARM64_ARCHITECTURE',
          supportLevel: 'supported',
        },
        {
          featureId: 'ARM64_ARCHITECTURE_WITH_CLUSTER_MANAGED_NETWORKING',
          supportLevel: 'supported',
        },
        {
          featureId: 'SINGLE_NODE_EXPANSION',
          supportLevel: 'supported',
        },
        {
          featureId: 'LVM',
          supportLevel: 'supported',
        },
        {
          featureId: 'DUAL_STACK_NETWORKING',
          supportLevel: 'supported',
        },
        {
          featureId: 'NUTANIX_INTEGRATION',
          supportLevel: 'supported',
        },
        {
          featureId: 'MULTIARCH_RELEASE_IMAGE',
          supportLevel: 'tech-preview',
        },
        {
          featureId: 'VIP_AUTO_ALLOC',
          supportLevel: 'dev-preview',
        },
      ],
      openshiftVersion: '4.12',
    },
  ],
};
