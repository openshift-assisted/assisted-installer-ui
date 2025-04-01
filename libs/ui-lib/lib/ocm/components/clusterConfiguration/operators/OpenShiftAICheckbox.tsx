import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { getFieldId, PopoverIcon, OPENSHIFT_AI_LINK } from '../../../../common';
import OpenShiftAIRequirements from './OpenShiftAIRequirements';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/assisted-installer-service';

const OPENSHIFT_AI_FIELD_NAME = 'useOpenShiftAI';

type OpenShiftAILabelProps = {
  disabledReason?: string;
  supportLevel?: SupportLevel;
};

const OpenShiftAILabel = ({ disabledReason, supportLevel }: OpenShiftAILabelProps) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>OpenShift AI </span>
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

const OpenShiftAICheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(OPENSHIFT_AI_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={OPENSHIFT_AI_FIELD_NAME}
        label={<OpenShiftAILabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        isDisabled={!!disabledReason}
        helperText={<OpenShiftAIHelperText />}
      />
    </FormGroup>
  );
};

export default OpenShiftAICheckbox;
