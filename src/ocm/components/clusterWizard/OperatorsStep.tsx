import React from 'react';
import { useSelector } from 'react-redux';
import { Stack, StackItem } from '@patternfly/react-core';
import {
  ClusterOperatorProps,
  ClusterWizardStepHeader,
  useFeature,
  useFeatureSupportLevel,
} from '../../../common';
import { selectIsCurrentClusterSNO } from '../../selectors';
import CnvCheckbox from '../clusterConfiguration/operators/CnvCheckbox';
import OdfCheckbox from '../clusterConfiguration/operators/OdfCheckbox';
import LvmCheckbox from '../clusterConfiguration/operators/LvmCheckbox';

export const OperatorsStep = (props: ClusterOperatorProps) => {
  const featureSupportLevel = useFeatureSupportLevel();

  const isSNO = useSelector(selectIsCurrentClusterSNO);
  const isOpenshiftDataFoundationEnabled = useFeature('ASSISTED_INSTALLER_OCS_FEATURE') && !isSNO;
  const isContainerNativeVirtualizationEnabled = useFeature('ASSISTED_INSTALLER_CNV_FEATURE');
  const isLVMSupported = featureSupportLevel.isFeatureSupported(
    props.openshiftVersion || '',
    'LVM',
  );

  return (
    <Stack hasGutter>
      <StackItem>
        <ClusterWizardStepHeader>Operators</ClusterWizardStepHeader>
      </StackItem>
      {isContainerNativeVirtualizationEnabled && (
        <StackItem>
          <CnvCheckbox {...props} />
        </StackItem>
      )}
      {isOpenshiftDataFoundationEnabled && (
        <StackItem>
          <OdfCheckbox openshiftVersion={props.openshiftVersion} />
        </StackItem>
      )}
      {isSNO && isLVMSupported && (
        <StackItem>
          <LvmCheckbox {...props} />
        </StackItem>
      )}
    </Stack>
  );
};
