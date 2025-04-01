import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, SELF_NODE_REMEDIATION_LINK } from '../../../../common';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';

const SELF_NODE_REMEDIATION_FIELD_NAME = 'useSelfNodeRemediation';
const SELF_NODE_REMEDIATION_FEATURE_ID = 'SELF_NODE_REMEDIATION';

const SelfNodeRemediationLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Self Node Remediation </span>
      </Tooltip>
      <NewFeatureSupportLevelBadge
        featureId={SELF_NODE_REMEDIATION_FEATURE_ID}
        supportLevel={supportLevel}
      />
    </>
  );
};

const SelfNodeRemediationHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Allows nodes to reboot themselves when they become unhealthy.{' '}
        <a href={SELF_NODE_REMEDIATION_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const SelfNodeRemediationCheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(SELF_NODE_REMEDIATION_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={SELF_NODE_REMEDIATION_FIELD_NAME}
        label={
          <SelfNodeRemediationLabel disabledReason={disabledReason} supportLevel={supportLevel} />
        }
        helperText={<SelfNodeRemediationHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default SelfNodeRemediationCheckbox;
