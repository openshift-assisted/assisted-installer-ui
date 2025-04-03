import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, NODE_HEALTHCHECK_LINK } from '../../../../common';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';

const NODE_HEALTHCHECK_FIELD_NAME = 'useNodeHealthcheck';
const NODE_HEALTHCHECK_FEATURE_ID = 'NODE_HEALTHCHECK';

const NodeHealthcheckLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Node Healthcheck </span>
      </Tooltip>
      <NewFeatureSupportLevelBadge
        featureId={NODE_HEALTHCHECK_FEATURE_ID}
        supportLevel={supportLevel}
      />
    </>
  );
};

const NodeHealthcheckHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Identify Unhealthy Nodes.{' '}
        <a href={NODE_HEALTHCHECK_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const NodeHealthcheckCheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(NODE_HEALTHCHECK_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={NODE_HEALTHCHECK_FIELD_NAME}
        label={<NodeHealthcheckLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        helperText={<NodeHealthcheckHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default NodeHealthcheckCheckbox;
