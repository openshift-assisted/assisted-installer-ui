import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { AUTHORINO_OPERATOR_LINK, getFieldId } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

const AUTHORINO_FIELD_NAME = 'useAuthorino';

const AuthorinoLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Authorino </span>
      </Tooltip>

      <NewFeatureSupportLevelBadge featureId="AUTHORINO" supportLevel={supportLevel} />
    </>
  );
};

const AuthorinoHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Lightweigth external authorization service for tailor-made Zero Trust API security.{' '}
        <a href={AUTHORINO_OPERATOR_LINK} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const AuthorinoCheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(AUTHORINO_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={AUTHORINO_FIELD_NAME}
        label={<AuthorinoLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        helperText={<AuthorinoHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default AuthorinoCheckbox;
