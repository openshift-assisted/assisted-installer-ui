import React from 'react';
import { CheckboxField, Cluster, getFieldId, PopoverIcon } from '../../../common';
import { FeatureSupportLevelContext } from '../../../common/components/featureSupportLevels';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { CNVHostRequirementsContent } from '../hosts/HostRequirementsContent';
import { HelpIcon } from '@patternfly/react-icons';

const CNVLabel: React.FC<{ clusterId: Cluster['id']; isSingleNode?: boolean }> = ({
  clusterId,
  isSingleNode,
}) => {
  return (
    <>
      Install OpenShift Virtualization{' '}
      <PopoverIcon
        component={'a'}
        variant={'plain'}
        IconComponent={HelpIcon}
        minWidth="50rem"
        headerContent="Additional Requirements"
        bodyContent={
          <CNVHostRequirementsContent clusterId={clusterId} isSingleNode={isSingleNode} />
        }
      />
    </>
  );
};

export type CnvCheckboxProps = {
  openshiftVersion?: string;
  isSNO: boolean;
  clusterId: string;
};

export const CnvCheckbox: React.FC<CnvCheckboxProps> = ({ openshiftVersion, isSNO, clusterId }) => {
  const { getFeatureDisabledReason } = React.useContext(FeatureSupportLevelContext);
  const name = 'useContainerNativeVirtualization';
  const fieldId = getFieldId(name, 'input');
  const disabledReason = openshiftVersion
    ? getFeatureDisabledReason(openshiftVersion, 'CNV')
    : undefined;
  return (
    <FormGroup isInline fieldId={fieldId}>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <CheckboxField
          name={name}
          label={<CNVLabel clusterId={clusterId} isSingleNode={isSNO} />}
          helperText="Run virtual machines along containers."
          isDisabled={!!disabledReason}
        />
      </Tooltip>
    </FormGroup>
  );
};
