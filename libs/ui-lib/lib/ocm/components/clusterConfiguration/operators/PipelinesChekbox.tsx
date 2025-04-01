import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PIPELINES_OPERATOR_LINK } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

const PIPELINES_FIELD_NAME = 'usePipelines';

const PipelinesLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Pipelines </span>
      </Tooltip>
      <NewFeatureSupportLevelBadge featureId="PIPELINES" supportLevel={supportLevel} />
    </>
  );
};

const PipelinesHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Cloud-native continuous integration and delivery (CI/CD) solution for building pipelines
        using Tekton.{' '}
        <a href={PIPELINES_OPERATOR_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const PipelinesCheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(PIPELINES_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={PIPELINES_FIELD_NAME}
        label={<PipelinesLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        helperText={<PipelinesHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default PipelinesCheckbox;
