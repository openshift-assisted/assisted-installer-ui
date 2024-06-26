import React from 'react';
import { useSelector } from 'react-redux';
import { Stack, StackItem } from '@patternfly/react-core';
import { ClusterOperatorProps, ClusterWizardStepHeader } from '../../../common';
import CnvCheckbox from '../clusterConfiguration/operators/CnvCheckbox';
import OdfCheckbox from '../clusterConfiguration/operators/OdfCheckbox';
import LvmCheckbox from '../clusterConfiguration/operators/LvmCheckbox';
import MceCheckbox from '../clusterConfiguration/operators/MceCheckbox';
import { selectIsCurrentClusterSNO } from '../../store/slices/current-cluster/selectors';
import { isOCPVersionEqualsOrMajor } from '../utils';

export const OperatorsStep = (props: ClusterOperatorProps) => {
  const isSNO = useSelector(selectIsCurrentClusterSNO);
  const isVersionEqualsOrMajorThan4_15 = isOCPVersionEqualsOrMajor(
    props.openshiftVersion || '',
    '4.15',
  );
  return (
    <Stack hasGutter data-testid={'operators-form'}>
      <StackItem>
        <ClusterWizardStepHeader>Operators</ClusterWizardStepHeader>
      </StackItem>
      <StackItem>
        <CnvCheckbox {...props} isVersionEqualsOrMajorThan4_15={isVersionEqualsOrMajorThan4_15} />
      </StackItem>
      <StackItem>
        <MceCheckbox
          clusterId={props.clusterId}
          isVersionEqualsOrMajorThan4_15={isVersionEqualsOrMajorThan4_15}
        />
      </StackItem>
      {isVersionEqualsOrMajorThan4_15 ? (
        <>
          <StackItem>
            <LvmCheckbox {...props} />
          </StackItem>
          <StackItem>
            <OdfCheckbox />
          </StackItem>
        </>
      ) : (
        <StackItem>{isSNO ? <LvmCheckbox {...props} /> : <OdfCheckbox />}</StackItem>
      )}
    </Stack>
  );
};
