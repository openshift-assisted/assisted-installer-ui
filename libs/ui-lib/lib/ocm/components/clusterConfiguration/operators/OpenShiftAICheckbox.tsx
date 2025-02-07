import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { useFormikContext } from 'formik';
import { getFieldId, PopoverIcon, OPENSHIFT_AI_LINK, OperatorsValues } from '../../../../common';
import OpenShiftAIRequirements from './OpenShiftAIRequirements';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/assisted-installer-service';
import { getOpenShiftAIIncompatibleWithLvmsReason } from '../../featureSupportLevels/featureStateUtils';

const OPENSHIFT_AI_FIELD_NAME = 'useOpenShiftAI';

type OpenShiftAILabelProps = {
  disabledReason?: string;
  supportLevel?: SupportLevel;
};

const OpenShiftAILabel = ({ disabledReason, supportLevel }: OpenShiftAILabelProps) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install OpenShift AI bundle </span>
      </Tooltip>
      <PopoverIcon
        component={'a'}
        headerContent="Requirements and dependencies"
        bodyContent={<OpenShiftAIRequirements />}
      />
      <NewFeatureSupportLevelBadge featureId="OPENSHIFT_AI" supportLevel={supportLevel} />
    </>
  );
};

const OpenShiftAIHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Train, serve, monitor and manage AI/ML models and applications.{' '}
        <a href={OPENSHIFT_AI_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const OpenShiftAICheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const featureSupportLevel = useNewFeatureSupportLevel();
  const { values } = useFormikContext<OperatorsValues>();
  const fieldId = getFieldId(OPENSHIFT_AI_FIELD_NAME, 'input');
  const [disabledReasonAI, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    let disabledReason = featureSupportLevel.getFeatureDisabledReason('OPENSHIFT_AI');
    if (!disabledReason) {
      disabledReason = getOpenShiftAIIncompatibleWithLvmsReason(values);
    }
    setDisabledReason(disabledReason);
  }, [values, featureSupportLevel]);

  React.useEffect(() => {
    setDisabledReason(disabledReason);
  }, [disabledReason]);

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={OPENSHIFT_AI_FIELD_NAME}
        label={
          <OpenShiftAILabel
            disabledReason={disabledReasonAI}
            supportLevel={featureSupportLevel.getFeatureSupportLevel('OPENSHIFT_AI')}
          />
        }
        isDisabled={!!disabledReasonAI}
        helperText={<OpenShiftAIHelperText />}
      />
    </FormGroup>
  );
};

export default OpenShiftAICheckbox;
