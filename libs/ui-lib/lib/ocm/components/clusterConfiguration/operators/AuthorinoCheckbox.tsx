import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';

const AUTHORINO_FIELD_NAME = 'useAuthorino';

const AuthorinoLabel = ({ disabledReason }: { disabledReason?: string }) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install Authorino</span>
      </Tooltip>
      <PopoverIcon
        id={AUTHORINO_FIELD_NAME}
        component={'a'}
        bodyContent={'No additional requirements needed'}
      />
    </>
  );
};

const AuthorinoHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Lightweigth external authorization service for tailor-made Zero Trust API security.{' '}
      </HelperTextItem>
    </HelperText>
  );
};

const AuthorinoCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const fieldId = getFieldId(AUTHORINO_FIELD_NAME, 'input');
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={AUTHORINO_FIELD_NAME}
        label={<AuthorinoLabel disabledReason={disabledReason} />}
        helperText={<AuthorinoHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default AuthorinoCheckbox;
