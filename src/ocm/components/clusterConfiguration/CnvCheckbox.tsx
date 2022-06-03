import React from 'react';
import { CheckboxField, Cluster, getFieldId, PopoverIcon } from '../../../common';
import { useFeatureSupportLevel } from '../../../common/components/featureSupportLevels';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import CNVHostRequirementsContent from '../hosts/CNVHostRequirementsContent';

const CNVLabel = ({
  clusterId,
  isSingleNode,
}: {
  clusterId: Cluster['id'];
  isSingleNode?: boolean;
}) => {
  return (
    <>
      Install OpenShift Virtualization{' '}
      <PopoverIcon
        component={'a'}
        headerContent="Additional Requirements"
        bodyContent={
          <CNVHostRequirementsContent clusterId={clusterId} isSingleNode={isSingleNode} />
        }
      />
    </>
  );
};

export type CnvCheckboxProps = {
  clusterId: string;
  openshiftVersion?: string;
  isSNO: boolean;
  isDisabled: boolean;
};

export const CnvCheckbox = ({
  clusterId,
  openshiftVersion,
  isSNO,
  isDisabled,
}: CnvCheckboxProps) => {
  const featureSupportLevelContext = useFeatureSupportLevel();
  const name = 'useContainerNativeVirtualization';
  const fieldId = getFieldId(name, 'input');
  const disabledReason = openshiftVersion
    ? featureSupportLevelContext.getFeatureDisabledReason(openshiftVersion, 'CNV')
    : undefined;
  return (
    <FormGroup isInline fieldId={fieldId}>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <CheckboxField
          name={name}
          label={<CNVLabel clusterId={clusterId} isSingleNode={isSNO} />}
          helperText="Run virtual machines along containers."
          isDisabled={isDisabled || !!disabledReason}
        />
      </Tooltip>
    </FormGroup>
  );
};
