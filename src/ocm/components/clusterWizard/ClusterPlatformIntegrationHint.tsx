import React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useClusterSupportedPlatforms } from '../../hooks';
import {
  isClusterPlatformTypeVM,
  NUTANIX_CONFIG_LINK,
  PlatformType,
  SupportedPlatformType,
  VSPHERE_CONFIG_LINK,
} from '../../../common';
import { useNewFeatureSupportLevel } from '../../../common/components/newFeatureSupportLevels';

type ClusterPlatformIntegrationHintProps = {
  clusterId: string;
  platformType: PlatformType;
};

const integrationBrands: Record<SupportedPlatformType, string> = {
  vsphere: 'vSphere',
  nutanix: 'Nutanix',
};

export const integrationPlatformLinks: Record<SupportedPlatformType, string> = {
  vsphere: VSPHERE_CONFIG_LINK,
  nutanix: NUTANIX_CONFIG_LINK,
};

export const ClusterPlatformIntegrationHint = ({
  clusterId,
  platformType,
}: ClusterPlatformIntegrationHintProps) => {
  const { isPlatformIntegrationSupported, supportedPlatformIntegration } =
    useClusterSupportedPlatforms(clusterId);

  const featureSupportLevels = useNewFeatureSupportLevel();
  const isNutanixFeatureSupported =
    featureSupportLevels.isFeatureSupported('NUTANIX_INTEGRATION') ?? false;
  const canIntegrateWithPlatform =
    isPlatformIntegrationSupported &&
    !isClusterPlatformTypeVM({ platform: { type: platformType } });

  if (!canIntegrateWithPlatform) {
    return null;
  }

  //Not show nutanix message in host discovery step when nutanix is not supported
  if (supportedPlatformIntegration === 'nutanix' && !isNutanixFeatureSupported) {
    return null;
  }

  const integrationBrand = integrationBrands[supportedPlatformIntegration as SupportedPlatformType];

  return (
    <Alert
      title={`Discover the full potential of ${integrationBrand} integration`}
      variant={AlertVariant.info}
      isInline
      data-testid="discover-platform-integration-hosts"
    >
      {`Since all of your hosts originated from the ${integrationBrand} platform, you now have the option to integrate with it.`}
    </Alert>
  );
};
