import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';

const SERVERLESS_FIELD_NAME = 'useServerless';

const ServerlessLabel = ({ disabledReason }: { disabledReason?: string }) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install Serverless </span>
      </Tooltip>
      <PopoverIcon
        id={SERVERLESS_FIELD_NAME}
        component={'a'}
        bodyContent={'No additional requirements needed'}
      />
    </>
  );
};

const ServerlessHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Deploy workflow applications based on the CNCF Serverless Workflow specification.{' '}
      </HelperTextItem>
    </HelperText>
  );
};

const ServerlessCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const fieldId = getFieldId(SERVERLESS_FIELD_NAME, 'input');
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={SERVERLESS_FIELD_NAME}
        label={<ServerlessLabel disabledReason={disabledReason} />}
        helperText={<ServerlessHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default ServerlessCheckbox;
