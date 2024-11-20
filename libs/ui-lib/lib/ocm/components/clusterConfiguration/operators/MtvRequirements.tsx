import React from 'react';
import { useSelector } from 'react-redux';
import { List, ListItem } from '@patternfly/react-core';
import { useClusterPreflightRequirements } from '../../../hooks';
import { ErrorState, LoadingState, OPERATOR_NAME_MTV, RenderIf } from '../../../../common';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { selectIsCurrentClusterSNO } from '../../../store/slices/current-cluster/selectors';

const MtvRequirements = ({ clusterId }: { clusterId: Cluster['id'] }) => {
  const { preflightRequirements, error, isLoading } = useClusterPreflightRequirements(clusterId);
  const isSingleNode = useSelector(selectIsCurrentClusterSNO);

  if (isLoading) {
    return <LoadingState content="Loading hardware requirements ..." />;
  }
  if (error) {
    return <ErrorState />;
  }

  const mtvRequirements = preflightRequirements?.operators?.find(
    (operatorRequirements) => operatorRequirements.operatorName === OPERATOR_NAME_MTV,
  );

  const workerRequirements = mtvRequirements?.requirements?.worker?.quantitative;
  const masterRequirements = mtvRequirements?.requirements?.master?.quantitative;
  return (
    <>
      <List>
        <RenderIf condition={!isSingleNode}>
          <ListItem>
            Each worker node requires an additional {workerRequirements?.ramMib || 360} MiB of
            memory {workerRequirements?.diskSizeGb ? ',' : ' and'}{' '}
            {workerRequirements?.cpuCores || 2} CPUs
            {workerRequirements?.diskSizeGb
              ? ` and ${workerRequirements?.diskSizeGb} storage space`
              : ''}
          </ListItem>
        </RenderIf>
        <ListItem>
          Each control plane node requires an additional {masterRequirements?.ramMib || 150} MiB of
          memory {masterRequirements?.diskSizeGb ? ',' : ' and'} {masterRequirements?.cpuCores || 4}{' '}
          CPUs
          {masterRequirements?.diskSizeGb
            ? ` and ${masterRequirements?.diskSizeGb} storage space`
            : ''}
        </ListItem>
      </List>
    </>
  );
};

export default MtvRequirements;
