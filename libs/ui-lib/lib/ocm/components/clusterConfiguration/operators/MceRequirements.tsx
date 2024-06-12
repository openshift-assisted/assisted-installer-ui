import React from 'react';
import { useSelector } from 'react-redux';
import { List, ListItem } from '@patternfly/react-core';
import { useClusterPreflightRequirements } from '../../../hooks';
import { ErrorState, LoadingState, OPERATOR_NAME_CNV, RenderIf } from '../../../../common';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { selectIsCurrentClusterSNO } from '../../../store/slices/current-cluster/selectors';
import { getOdfLvmsText } from './utils';

const MceRequirements = ({
  clusterId,
  isVersionEqualsOrMajorThan4_15,
}: {
  clusterId: Cluster['id'];
  isVersionEqualsOrMajorThan4_15: boolean;
}) => {
  const { preflightRequirements, error, isLoading } = useClusterPreflightRequirements(clusterId);
  const isSingleNode = useSelector(selectIsCurrentClusterSNO);

  if (isLoading) {
    return <LoadingState content="Loading hardware requirements ..." />;
  }
  if (error) {
    return <ErrorState />;
  }

  const mceRequirements = preflightRequirements?.operators?.find(
    (operatorRequirements) => operatorRequirements.operatorName === OPERATOR_NAME_CNV,
  );

  const workerRequirements = mceRequirements?.requirements?.worker?.quantitative;
  const masterRequirements = mceRequirements?.requirements?.master?.quantitative;
  const odfLvmsText = getOdfLvmsText(isSingleNode, isVersionEqualsOrMajorThan4_15);
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
        <ListItem>{odfLvmsText}</ListItem>
      </List>
    </>
  );
};

export default MceRequirements;
