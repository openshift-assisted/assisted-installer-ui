import React from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import {
  CheckboxField,
  PopoverHelperIcon,
  getFieldId,
  useFeatureSupportLevel,
  ODF_REQUIREMENTS_LINK,
} from '../../../common';

const ODFLabel = () => (
  <>
    Install OpenShift Data Foundation{' '}
    <PopoverHelperIcon
      headerContent="Additional Requirements"
      bodyContent={
        <a href={ODF_REQUIREMENTS_LINK} target="_blank" rel="noopener noreferrer">
          Learn more about the requirements for OpenShift Data Foundation <ExternalLinkAltIcon />.
        </a>
      }
    />
  </>
);

export type ODFCheckboxProps = {
  openshiftVersion?: string;
};

export const ODFCheckbox: React.FC<ODFCheckboxProps> = ({ openshiftVersion }) => {
  const featureSupportLevelContext = useFeatureSupportLevel();
  const name = 'useExtraDisksForLocalStorage';
  const fieldId = getFieldId(name, 'input');
  const disabledReason = openshiftVersion
    ? featureSupportLevelContext.getFeatureDisabledReason(openshiftVersion, 'ODF')
    : undefined;
  return (
    <FormGroup isInline fieldId={fieldId}>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <CheckboxField
          name={name}
          label={<ODFLabel />}
          isDisabled={!!disabledReason}
          helperText="Persistent software-defined storage for hybrid applications."
        />
      </Tooltip>
    </FormGroup>
  );
};
