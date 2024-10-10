import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import {
  getFieldId,
  PopoverIcon,
  OAI_REQUIREMENTS_LINK,
  OAI_LINK,
  OperatorsValues,
} from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import { useFormikContext } from 'formik';

const OAI_FIELD_NAME = 'useOpenShiftAI';

const OdfLabel = ({ disabledReason }: { disabledReason?: string }) => (
  <>
    <Tooltip hidden={!disabledReason} content={disabledReason}>
      <span>Install OpenShift AI </span>
    </Tooltip>
    <PopoverIcon
      component={'a'}
      headerContent="Additional requirements"
      bodyContent={
        <a href={OAI_REQUIREMENTS_LINK} target="_blank" rel="noopener noreferrer">
          Learn more about the requirements for OpenShift AI <ExternalLinkAltIcon />.
        </a>
      }
    />
  </>
);

const OdfHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Train, serve, monitor and manage AI/ML models and applications.{' '}
        <a href={OAI_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const OaiCheckbox = () => {
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  const { values } = useFormikContext<OperatorsValues>();
  const fieldId = getFieldId(OAI_FIELD_NAME, 'input');
  const [disabledReason, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    let disabledReason = featureSupportLevelContext.getFeatureDisabledReason('OAI');
    setDisabledReason(disabledReason);
  }, [values, featureSupportLevelContext]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={OAI_FIELD_NAME}
        label={<OdfLabel disabledReason={disabledReason} />}
        isDisabled={!!disabledReason}
        helperText={<OdfHelperText />}
      />
    </FormGroup>
  );
};

export default OaiCheckbox;
