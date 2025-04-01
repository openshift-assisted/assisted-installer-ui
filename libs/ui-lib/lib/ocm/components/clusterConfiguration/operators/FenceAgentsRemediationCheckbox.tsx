import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, FENCE_AGENTS_REMEDIATION_LINK } from '../../../../common';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';

const FENCE_AGENTS_REMEDIATION_FIELD_NAME = 'useFenceAgentsRemediation';
const FENCE_AGENTS_REMEDIATION_FEATURE_ID = 'FENCE_AGENTS_REMEDIATION';

const FenceAgentsRemediationLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Fence Agents Remediation </span>
      </Tooltip>
      <NewFeatureSupportLevelBadge
        featureId={FENCE_AGENTS_REMEDIATION_FEATURE_ID}
        supportLevel={supportLevel}
      />
    </>
  );
};

const FenceAgentsRemediationHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Externally fences failed nodes using power controllers.{' '}
        <a href={FENCE_AGENTS_REMEDIATION_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const FenceAgentsRemediationCheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(FENCE_AGENTS_REMEDIATION_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={FENCE_AGENTS_REMEDIATION_FIELD_NAME}
        label={
          <FenceAgentsRemediationLabel
            disabledReason={disabledReason}
            supportLevel={supportLevel}
          />
        }
        helperText={<FenceAgentsRemediationHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default FenceAgentsRemediationCheckbox;
