import { AsyncFeatureStatus } from './async-feature-status';
import { CapabilitiesService } from '../../../services/capabilities-service';

export const externalFeatures: AsyncFeatureStatus[] = [
  {
    name: 'ASSISTED_INSTALLER_PLATFORM_OCI',
    isEnabled: () => {
      return CapabilitiesService.isCapabilityEnabled(
        'capability.organization.bare_metal_installer_platform_oci',
      );
    },
  },
  {
    name: 'ASSISTED_INSTALLER_MULTIARCH_SUPPORTED',
    isEnabled: () => {
      return CapabilitiesService.isCapabilityEnabled(
        'capability.organization.bare_metal_installer_multiarch',
      );
    },
  },
];
