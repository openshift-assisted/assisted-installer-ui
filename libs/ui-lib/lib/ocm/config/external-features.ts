import type { FeatureListType } from '../../common/features/featureGate';

type FeatureMapping = {
  featureId: keyof FeatureListType;
  capabilityId: string;
};
export const externalFeaturesMappings: Array<FeatureMapping> = [
  {
    featureId: 'ASSISTED_INSTALLER_PLATFORM_OCI',
    capabilityId: 'capability.organization.bare_metal_installer_platform_oci',
  },
  {
    featureId: 'ASSISTED_INSTALLER_MULTIARCH_SUPPORTED',
    capabilityId: 'capability.organization.bare_metal_installer_multiarch',
  },
];
