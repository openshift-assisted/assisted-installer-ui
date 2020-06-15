import React from 'react';
import { GridItem, Alert, AlertVariant } from '@patternfly/react-core';
import { Cluster } from '../../api/types';

type ClusterInstallationErrorProps = {
  statusInfo: Cluster['statusInfo'];
};
const ClusterInstallationError: React.FC<ClusterInstallationErrorProps> = ({ statusInfo }) => (
  <GridItem>
    <Alert variant={AlertVariant.danger} title={`Cluster installation failed`} isInline>
      {statusInfo}
    </Alert>
  </GridItem>
);

export default ClusterInstallationError;
