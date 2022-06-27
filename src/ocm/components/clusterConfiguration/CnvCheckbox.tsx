import React from 'react';
import { CheckboxField, Cluster, getFieldId, CNV_LINK, PopoverIcon } from '../../../common';
import { useFeatureSupportLevel } from '../../../common/components/featureSupportLevels';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import CNVHostRequirementsContent from '../hosts/CNVHostRequirementsContent';

const CNVLabel: React.FC<{ clusterId: Cluster['id']; isSingleNode?: boolean }> = ({
  clusterId,
  isSingleNode,
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
  openshiftVersion?: string;
  isSNO: boolean;
  clusterId: string;
};

const CNVHelperText: React.FC = () => {
  return (
    <>
      Run virtual machines alongside containers on one platform.{' '}
      <a href={CNV_LINK} target="_blank" rel="noopener noreferrer">
        {'Learn more'} <ExternalLinkAltIcon />
      </a>
    </>
  );
};

export const CnvCheckbox: React.FC<CnvCheckboxProps> = ({ openshiftVersion, isSNO, clusterId }) => {
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
          helperText={<CNVHelperText />}
          isDisabled={!!disabledReason}
        />
      </Tooltip>
    </FormGroup>
  );
};
