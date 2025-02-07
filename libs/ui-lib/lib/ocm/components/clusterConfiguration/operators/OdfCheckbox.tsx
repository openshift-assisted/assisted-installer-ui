import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import {
  getFieldId,
  PopoverIcon,
  ODF_REQUIREMENTS_LINK,
  ODF_LINK,
  OperatorsValues,
} from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import { useFormikContext } from 'formik';
import { getOdfIncompatibleWithLvmsReason } from '../../featureSupportLevels/featureStateUtils';

const ODF_FIELD_NAME = 'useOpenShiftDataFoundation';

const OdfLabel = ({ disabledReason }: { disabledReason?: string }) => (
  <>
    <Tooltip hidden={!disabledReason} content={disabledReason}>
      <span>Install OpenShift Data Foundation </span>
    </Tooltip>
    <PopoverIcon
      component={'a'}
      headerContent="Additional requirements"
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
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Persistent software-defined storage for hybrid applications.{' '}
        <a href={ODF_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const OdfCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const featureSupportLevelContext = useNewFeatureSupportLevel();
  const { values } = useFormikContext<OperatorsValues>();
  const fieldId = getFieldId(ODF_FIELD_NAME, 'input');
  const [disabledReasonOdf, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    let disabledReason = featureSupportLevelContext.getFeatureDisabledReason('ODF');
    if (!disabledReason) {
      disabledReason = getOdfIncompatibleWithLvmsReason(values);
    }
    setDisabledReason(disabledReason);
  }, [values, featureSupportLevelContext]);

  React.useEffect(() => {
    setDisabledReason(disabledReason);
  }, [disabledReason]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={ODF_FIELD_NAME}
        label={<OdfLabel disabledReason={disabledReasonOdf} />}
        isDisabled={!!disabledReasonOdf}
        helperText={<OdfHelperText />}
      />
    </FormGroup>
  );
};

export default OdfCheckbox;
