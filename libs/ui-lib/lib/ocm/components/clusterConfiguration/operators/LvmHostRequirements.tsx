import React from 'react';
import { List, ListItem } from '@patternfly/react-core';
import { useClusterPreflightRequirements } from '../../../hooks';
import {
  ClusterOperatorProps,
  ErrorState,
  LoadingState,
  OPERATOR_NAME_LVM,
} from '../../../../common';
import { HostTypeHardwareRequirements } from '@openshift-assisted/types/assisted-installer-service';

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

  const { qualitative = [] } = lvmRequirements?.requirements
    ?.master as HostTypeHardwareRequirements;

  return (
    <List>
      {qualitative.map((qualitativeItem, index) => (
        <ListItem key={index}>{qualitativeItem}</ListItem>
      ))}
    </List>
  );
};

export default LvmHostRequirements;
