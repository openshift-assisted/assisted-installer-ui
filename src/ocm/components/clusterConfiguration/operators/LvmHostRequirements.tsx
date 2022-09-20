import React from 'react';
import { List, ListItem } from '@patternfly/react-core';
import { useClusterPreflightRequirements } from '../../../hooks';
import {
  HostTypeHardwareRequirements,
  ClusterOperatorProps,
  ErrorState,
  LoadingState,
  OPERATOR_NAME_LVM,
} from '../../../../common';

const LvmHostRequirements = ({ clusterId }: { clusterId: ClusterOperatorProps['clusterId'] }) => {
  const { preflightRequirements, error, isLoading } = useClusterPreflightRequirements(clusterId);

  if (isLoading) {
    return <LoadingState content="Loading hardware requirements ..." />;
  }
  if (error) {
    return <ErrorState />;
  }

  const lvmRequirements = preflightRequirements?.operators?.find(
    (operatorRequirements) => operatorRequirements.operatorName === OPERATOR_NAME_LVM,
  );

  const { qualitative = [], quantitative } = lvmRequirements?.requirements
    ?.master as HostTypeHardwareRequirements;

  return (
    <List>
      {quantitative && (
        <ListItem>
          The host node requires an additional {quantitative.ramMib} MiB of memory{' '}
          {quantitative.diskSizeGb ? ',' : ' and'} {quantitative.cpuCores} CPUs
          {quantitative?.diskSizeGb ? ` and ${quantitative?.diskSizeGb} storage space` : ''}
        </ListItem>
      )}
      {qualitative.map((qualitativeItem, index) => (
        <ListItem key={index}>{qualitativeItem}</ListItem>
      ))}
    </List>
  );
};

export default LvmHostRequirements;
