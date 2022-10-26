import React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useClusterSupportedPlatforms } from '../../hooks';
import { isClusterPlatformTypeVM, PlatformType, SupportedPlatformType } from '../../../common';

type ClusterPlatformIntegrationHintProps = {
  clusterId: string;
  platformType: PlatformType;
};

const integrationBrands: Record<SupportedPlatformType, string> = {
  vsphere: 'vSphere',
  nutanix: 'Nutanix',
};

export const ClusterPlatformIntegrationHint = ({
  clusterId,
  platformType,
}: ClusterPlatformIntegrationHintProps) => {
  const { isPlatformIntegrationSupported, supportedPlatformIntegration } =
    useClusterSupportedPlatforms(clusterId);

  const canIntegrateWithPlatform =
    isPlatformIntegrationSupported &&
    !isClusterPlatformTypeVM({ platform: { type: platformType } });
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
