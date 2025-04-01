import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, NODE_HEALTHCHECK_LINK } from '../../../../common';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';

const NODE_MAINTENANCE_FIELD_NAME = 'useNodeMaintenance';
const NODE_MAINTENANCE_FEATURE_ID = 'NODE_MAINTENANCE';

const NodeMaintenanceLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Node Maintenance </span>
      </Tooltip>
      <NewFeatureSupportLevelBadge
        featureId={NODE_MAINTENANCE_FEATURE_ID}
        supportLevel={supportLevel}
      />
    </>
  );
};

const NodeMaintenanceHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Place nodes in maintenance mode.{' '}
        <a href={NODE_HEALTHCHECK_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const NodeMaintenanceCheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(NODE_MAINTENANCE_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={NODE_MAINTENANCE_FIELD_NAME}
        label={<NodeMaintenanceLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        helperText={<NodeMaintenanceHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default NodeMaintenanceCheckbox;
