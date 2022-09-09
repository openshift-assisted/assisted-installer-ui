import * as React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import {
  Cluster,
  FormatDiskWarning,
  hasEnabledOperators,
  OPERATOR_NAME_ODF,
} from '../../../common';
import { isAddHostsCluster } from '../clusters/utils';
import OdfDisksManualFormattingHint from './OdfDisksManualFormattingHint';

const StorageAlerts = ({ cluster }: { cluster: Cluster }) => {
  const showFormattingHint =
    hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_ODF) &&
    !isAddHostsCluster(cluster);
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
