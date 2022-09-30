import React from 'react';
import { Alert, AlertVariant } from '@patternfly/react-core';
import { useClusterSupportedPlatforms } from '../../hooks';

type ClusterPlatformIntegrationHintProps = {
  clusterId: string;
  platformType: string | undefined;
};

export const ClusterPlatformIntegrationHint: React.FC<ClusterPlatformIntegrationHintProps> = ({
  clusterId,
  platformType,
}) => {
  const { isPlatformIntegrationSupported } = useClusterSupportedPlatforms(clusterId);
  if (isPlatformIntegrationSupported) {
    return (
      <Alert
        title={
          platformType === 'vsphere'
            ? 'Discover the full potential of vSphere integration'
            : 'Discover the full potential of Nutanix integration'
        }
        variant={AlertVariant.info}
        isInline={true}
        data-testid="discover-vsphere-hosts"
      >
        {platformType === 'vsphere'
          ? 'Since all of your hosts originated from the vSphere platform, you now have the option to integrate with it.'
          : 'Since all of your hosts originated from the Nutanix platform, you now have the option to integrate with it.'}
      </Alert>
    );
  } else return null;
};
