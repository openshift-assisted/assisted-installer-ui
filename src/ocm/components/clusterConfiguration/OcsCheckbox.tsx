import React from 'react';
import { CheckboxField, getFieldId } from '../../../common';
import { FeatureSupportLevelContext } from '../../../common/components/featureSupportLevels';
import { FormGroup, Tooltip } from '@patternfly/react-core';

const OCSLabel: React.FC = () => (
  <>
    Install OpenShift Container Storage
    {/* TODO(mlibra): List of OCS requierements is stabilizing now - https://issues.redhat.com/browse/MGMT-4220 )
    <PopoverIcon
      component={'a'}
      variant={'plain'}
      IconComponent={HelpIcon}
      minWidth="50rem"
      headerContent="Additional Requirements"
      bodyContent={<>FOO BAR </>}/>
    */}
  </>
);

export type OcsCheckboxProps = {
  openshiftVersion?: string;
};

export const OcsCheckbox: React.FC<OcsCheckboxProps> = ({ openshiftVersion }) => {
  const { getFeatureDisabledReason } = React.useContext(FeatureSupportLevelContext);
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
          label={<OCSLabel />}
          isDisabled={!!disabledReason}
          helperText="Persistent software-defined storage for hybrid applications."
        />
      </Tooltip>
    </FormGroup>
  );
};
