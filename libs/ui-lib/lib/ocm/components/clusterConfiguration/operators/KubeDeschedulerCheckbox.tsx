import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, NODE_HEALTHCHECK_LINK } from '../../../../common';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';

const KUBE_DESCHEDULER_FIELD_NAME = 'useKubeDescheduler';
const KUBE_DESCHEDULER_FEATURE_ID = 'KUBE_DESCHEDULER';

const KubeDeschedulerLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Kube Descheduler </span>
      </Tooltip>
      <NewFeatureSupportLevelBadge
        featureId={KUBE_DESCHEDULER_FEATURE_ID}
        supportLevel={supportLevel}
      />
    </>
  );
};

const KubeDeschedulerHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Evicts pods to reschedule them onto more suitable nodes.{' '}
        <a href={NODE_HEALTHCHECK_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const KubeDeschedulerCheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(KUBE_DESCHEDULER_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={KUBE_DESCHEDULER_FIELD_NAME}
        label={<KubeDeschedulerLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        helperText={<KubeDeschedulerHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default KubeDeschedulerCheckbox;
