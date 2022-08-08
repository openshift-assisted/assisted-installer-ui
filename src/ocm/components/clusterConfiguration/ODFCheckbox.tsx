import React from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import {
  CheckboxField,
  getFieldId,
  useFeatureSupportLevel,
  PopoverIcon,
  ODF_REQUIREMENTS_LINK,
  ODF_LINK,
} from '../../../common';

const ODFLabel = () => (
  <>
    Install OpenShift Data Foundation{' '}
    <PopoverIcon
      component={'a'}
      headerContent="Additional Requirements"
      bodyContent={
        <a href={ODF_REQUIREMENTS_LINK} target="_blank" rel="noopener noreferrer">
          Learn more about the requirements for OpenShift Data Foundation <ExternalLinkAltIcon />.
        </a>
      }
    />
  </>
);

const ODFHelperText = () => {
  return (
    <>
      Persistent software-defined storage for hybrid applications.{' '}
      <a href={ODF_LINK} target="_blank" rel="noopener noreferrer">
        {'Learn more'} <ExternalLinkAltIcon />
      </a>
    </>
  );
};

export const ODFCheckbox = ({ openshiftVersion }: { openshiftVersion?: string }) => {
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
          helperText={<ODFHelperText />}
        />
      </Tooltip>
    </FormGroup>
  );
};
