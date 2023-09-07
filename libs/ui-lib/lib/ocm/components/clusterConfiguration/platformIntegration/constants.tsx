import { NUTANIX_CONFIG_LINK, VSPHERE_CONFIG_LINK } from '../../../../common';
import { PlatformType } from '../../../api';

export const ExternalPlatformLabels: { [key in PlatformType]: string } = {
  baremetal: 'No platform integration',
  none: 'No platform integration',
  nutanix: 'Nutanix',
  oci: 'Oracle  (Requires a custom manifest)',
  vsphere: 'vSphere',
};

export const ExternalPlatformLinks: Partial<{ [key in PlatformType]: string }> = {
  nutanix: NUTANIX_CONFIG_LINK,
  vsphere: VSPHERE_CONFIG_LINK,
};

export const ExternalPlatformTooltips: Partial<{ [key in PlatformType]: string }> = {
  oci: "To integrate with an external partner (for example, Oracle Cloud), you'll need to provide a custom manifest.",
};

export const ExternalPlaformIds: { [key in PlatformType]: string } = {
  baremetal: '',
  none: '',
  nutanix: 'NUTANIX_INTEGRATION',
  oci: 'EXTERNAL_PLATFORM_OCI',
  vsphere: 'VSPHERE_INTEGRATION',
};
