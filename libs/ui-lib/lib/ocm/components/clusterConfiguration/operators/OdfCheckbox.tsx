import React from 'react';
import { FormGroup, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';
import { getFieldId, PopoverIcon, ODF_REQUIREMENTS_LINK, ODF_LINK } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';

const ODF_FIELD_NAME = 'useOpenShiftDataFoundation';

const OdfLabel = ({ disabledReason }: { disabledReason?: string }) => (
  <>
    <Tooltip hidden={!disabledReason} content={disabledReason}>
      <span>Install OpenShift Data Foundation </span>
    </Tooltip>
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

const OdfHelperText = () => {
  return (
    <>
      Persistent software-defined storage for hybrid applications.{' '}
      <a href={ODF_LINK} target="_blank" rel="noopener noreferrer">
        {'Learn more'} <ExternalLinkAltIcon />
      </a>
    </>
  );
};

const OdfCheckbox = () => {
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  const fieldId = getFieldId(ODF_FIELD_NAME, 'input');
  const disabledReason = featureSupportLevelContext.getFeatureDisabledReason('ODF');
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={ODF_FIELD_NAME}
        label={<OdfLabel disabledReason={disabledReason} />}
        isDisabled={!!disabledReason}
        helperText={<OdfHelperText />}
      />
    </FormGroup>
  );
};

export default OdfCheckbox;
