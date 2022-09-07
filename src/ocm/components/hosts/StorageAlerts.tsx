import * as React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import { Cluster, FormatDiskWarning, hasOdfOperators } from '../../../common';
import { isAddHostsCluster } from '../clusters/utils';
import OdfDisksManualFormattingHint from './OdfDisksManualFormattingHint';

const StorageAlerts = ({ cluster }: { cluster: Cluster }) => {
  const showFormattingHint = hasOdfOperators(cluster) && !isAddHostsCluster(cluster);
  return (
    <Stack hasGutter>
      {showFormattingHint && (
        <StackItem>
          <OdfDisksManualFormattingHint />
        </StackItem>
      )}
      <StackItem>
        <FormatDiskWarning />
      </StackItem>
    </Stack>
  );
};

export default StorageAlerts;
