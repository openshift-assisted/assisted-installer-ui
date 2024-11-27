import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { useFormikContext } from 'formik';
import {
  getFieldId,
  PopoverIcon,
  OSC_REQUIREMENTS_LINK,
  OSC_LINK,
  OperatorsValues,
} from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/assisted-installer-service';

const OSC_FIELD_NAME = 'useOsc';

type OscLabelProps = {
  disabledReason?: string;
  supportLevel?: SupportLevel;
};

const OscLabel = ({ disabledReason, supportLevel }: OscLabelProps) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install OpenShift sandboxed containers </span>
      </Tooltip>
      <PopoverIcon
        component={'a'}
        headerContent="Additional requirements"
        bodyContent={
          <a href={OSC_REQUIREMENTS_LINK} target="_blank" rel="noopener noreferrer">
            Learn more about the requirements for OpenShift sandboxed containers{' '}
            <ExternalLinkAltIcon />.
          </a>
        }
      />
      <NewFeatureSupportLevelBadge featureId="OSC" supportLevel={supportLevel} />
    </>
  );
};

const OscHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Run sandboxed containers.{' '}
        <a href={OSC_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const OscCheckbox = () => {
  const featureSupportLevel = useNewFeatureSupportLevel();
  const { values } = useFormikContext<OperatorsValues>();
  const fieldId = getFieldId(OSC_FIELD_NAME, 'input');
  const [disabledReason, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    const disabledReason = featureSupportLevel.getFeatureDisabledReason('OSC');
    setDisabledReason(disabledReason);
  }, [values, featureSupportLevel]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={OSC_FIELD_NAME}
        label={
          <OscLabel
            disabledReason={disabledReason}
            supportLevel={featureSupportLevel.getFeatureSupportLevel('OSC')}
          />
        }
        isDisabled={!!disabledReason}
        helperText={<OscHelperText />}
      />
    </FormGroup>
  );
};

export default OscCheckbox;
