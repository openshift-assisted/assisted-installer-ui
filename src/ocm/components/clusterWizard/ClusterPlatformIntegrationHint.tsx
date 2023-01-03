import React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useClusterSupportedPlatforms } from '../../hooks';
import {
  isClusterPlatformTypeVM,
  NUTANIX_CONFIG_LINK,
  PlatformType,
  SupportedPlatformType,
  useFeatureSupportLevel,
  VSPHERE_CONFIG_LINK,
} from '../../../common';

type ClusterPlatformIntegrationHintProps = {
  clusterId: string;
  platformType: PlatformType;
  openshiftVersion: string;
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
  openshiftVersion,
}: ClusterPlatformIntegrationHintProps) => {
  const { isPlatformIntegrationSupported, supportedPlatformIntegration } =
    useClusterSupportedPlatforms(clusterId);
  const featureSupportLevels = useFeatureSupportLevel();
  const isNutanixFeatureSupported = featureSupportLevels.isFeatureSupported(
    openshiftVersion || '',
    'NUTANIX_INTEGRATION',
  );
  const canIntegrateWithPlatform =
    (isPlatformIntegrationSupported &&
      !isClusterPlatformTypeVM({ platform: { type: platformType } })) ||
    (supportedPlatformIntegration === 'nutanix' && isNutanixFeatureSupported);
  if (!canIntegrateWithPlatform) {
    return null;
  }

  const integrationBrand: string = integrationBrands[supportedPlatformIntegration] as string;

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
