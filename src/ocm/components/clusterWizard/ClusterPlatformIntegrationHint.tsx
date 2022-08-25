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
  if (isPlatformIntegrationSupported && platformType !== 'vsphere') {
    return (
      <Alert
        title="Discover the full potential of vSphere integration"
        variant={AlertVariant.info}
        isInline={true}
        data-testid="discover-vsphere-hosts"
      >
        Since all of your hosts originated from vSphere platform, you now have the option to
        integrate with vSphere. Switch the 'Integrate with vSphere' toggle to get started.
      </Alert>
    );
  } else return null;
};
