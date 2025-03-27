import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, SERVERLESS_OPERATOR_LINK } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

const SERVERLESS_FIELD_NAME = 'useServerless';

const ServerlessLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Serverless </span>
      </Tooltip>
      <NewFeatureSupportLevelBadge featureId="SERVERLESS" supportLevel={supportLevel} />
    </>
  );
};

const ServerlessHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Deploy workflow applications based on the CNCF Serverless Workflow specification.{' '}
        <a href={SERVERLESS_OPERATOR_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const ServerlessCheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(SERVERLESS_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={SERVERLESS_FIELD_NAME}
        label={<ServerlessLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        helperText={<ServerlessHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default ServerlessCheckbox;
