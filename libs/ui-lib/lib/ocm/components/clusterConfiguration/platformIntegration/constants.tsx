import { NUTANIX_CONFIG_LINK, VSPHERE_CONFIG_LINK } from '../../../../common';
import { PlatformType } from '@openshift-assisted/types/assisted-installer-service';

export const ExternalPlatformLabels: { [key in PlatformType]: string } = {
  baremetal: 'No platform integration',
  none: 'No platform integration',
  nutanix: 'Nutanix',
  oci: 'Oracle Cloud Infrastructure (Requires a custom manifest)',
  vsphere: 'vSphere',
  external: '',
};

export const ExternalPlatformLinks: Partial<{ [key in PlatformType]: string }> = {
  nutanix: NUTANIX_CONFIG_LINK,
  vsphere: VSPHERE_CONFIG_LINK,
};

export const ExternalPlaformIds: { [key in PlatformType]: string } = {
  baremetal: '',
  none: '',
  nutanix: 'NUTANIX_INTEGRATION',
  oci: 'EXTERNAL_PLATFORM_OCI',
  vsphere: 'VSPHERE_INTEGRATION',
  external: '',
};
