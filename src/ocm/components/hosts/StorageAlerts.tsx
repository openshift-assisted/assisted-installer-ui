import * as React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { Cluster, FormatDiskWarning, hasODFOperators } from '../../../common';
import { isAddHostsCluster } from '../clusters/utils';
import OCSDisksManualFormattingHint from './OCSDisksManualFormattingHint';

const StorageAlerts = ({ cluster }: { cluster: Cluster }) => {
  const showFormattingHint = hasODFOperators(cluster) && !isAddHostsCluster(cluster);
  return (
    <Stack hasGutter>
      {showFormattingHint && (
        <StackItem>
          <OCSDisksManualFormattingHint />
        </StackItem>
      )}
      <StackItem>
        <FormatDiskWarning />
      </StackItem>
    </Stack>
  );
};

export default StorageAlerts;
