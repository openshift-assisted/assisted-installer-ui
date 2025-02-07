import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';

const PIPELINES_FIELD_NAME = 'usePipelines';

const PipelinesLabel = ({ disabledReason }: { disabledReason?: string }) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install Pipelines</span>
      </Tooltip>
      <PopoverIcon
        id={PIPELINES_FIELD_NAME}
        component={'a'}
        bodyContent={'No additional requirements needed'}
      />
    </>
  );
};

const PipelinesHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Cloud-native continuous integration and delivery (CI/CD) solution for building pipelines
        using Tekton.{' '}
      </HelperTextItem>
    </HelperText>
  );
};

const PipelinesCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const fieldId = getFieldId(PIPELINES_FIELD_NAME, 'input');
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={PIPELINES_FIELD_NAME}
        label={<PipelinesLabel disabledReason={disabledReason} />}
        helperText={<PipelinesHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default PipelinesCheckbox;
