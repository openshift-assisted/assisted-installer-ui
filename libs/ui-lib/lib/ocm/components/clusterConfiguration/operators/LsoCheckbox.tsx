import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';

const LSO_FIELD_NAME = 'useLso';

const LsoLabel = ({ disabledReason }: { disabledReason?: string }) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install Local Storage Operator </span>
      </Tooltip>
      <PopoverIcon
        id={LSO_FIELD_NAME}
        component={'a'}
        bodyContent={'No additional requirements needed'}
      />
    </>
  );
};

const LsoHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Allows provisioning of persistent storage by using local volumes.{' '}
      </HelperTextItem>
    </HelperText>
  );
};

const LsoCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const fieldId = getFieldId(LSO_FIELD_NAME, 'input');
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={LSO_FIELD_NAME}
        label={<LsoLabel disabledReason={disabledReason} />}
        helperText={<LsoHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default LsoCheckbox;
