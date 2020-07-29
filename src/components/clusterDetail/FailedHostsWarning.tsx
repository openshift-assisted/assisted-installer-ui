import React from 'react';
import { GridItem, Alert, AlertVariant, TextContent, Text } from '@patternfly/react-core';
import { Cluster } from '../../api/types';

type FailedHostsWarningProps = {
  cluster: Cluster;
};

const FailedHostsWarning: React.FC<FailedHostsWarningProps> = ({ cluster }) => {
  const failedHosts =
    cluster.hosts?.filter((host) => host.role === 'worker' && host.status === 'error') || [];

  if (failedHosts.length === 0) {
    return null;
  }

  let title;
  if (failedHosts.length === 1) {
    title = `1 worker host failed to install`;
  } else {
    title = `${failedHosts.length} worker hosts failed to install`;
  }

  return (
    <GridItem>
      <Alert variant={AlertVariant.warning} title={title} isInline>
        <TextContent>
          <Text component="p">
            Error information for each worker host is available below. Debug and reboot each host to
            try again.
          </Text>
        </TextContent>
      </Alert>
    </GridItem>
  );
};

export default FailedHostsWarning;
