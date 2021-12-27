import React from 'react';
import { CheckboxField, getFieldId, PopoverIcon, ODF_REQUIREMENTS_LINK } from '../../../common';
import { useFeatureSupportLevel } from '../../../common/components/featureSupportLevels';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon, HelpIcon } from '@patternfly/react-icons';

const ODFLabel: React.FC = () => (
  <>
    Install OpenShift Data Foundation{' '}
    <PopoverIcon
      component={'a'}
      variant={'plain'}
      IconComponent={HelpIcon}
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
  const { getFeatureDisabledReason } = useFeatureSupportLevel();
  const name = 'useExtraDisksForLocalStorage';
  const fieldId = getFieldId(name, 'input');
  const disabledReason = openshiftVersion
    ? getFeatureDisabledReason(openshiftVersion, 'ODF')
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
