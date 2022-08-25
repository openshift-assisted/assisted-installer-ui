import React from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import {
  Cluster,
  CheckboxField,
  PopoverIcon,
  getFieldId,
  useFeatureSupportLevel,
  CNV_LINK,
} from '../../../common';
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
  openshiftVersion?: string;
  isSNO: boolean;
  clusterId: string;
};

const CNVHelperText = () => {
  return (
    <>
      Run virtual machines alongside containers on one platform.{' '}
      <a href={CNV_LINK} target="_blank" rel="noopener noreferrer">
        {'Learn more'} <ExternalLinkAltIcon />
      </a>
    </>
  );
};

export const CnvCheckbox = ({ openshiftVersion, isSNO, clusterId }: CnvCheckboxProps) => {
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
