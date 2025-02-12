import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';

const NVIDIAGPU_FIELD_NAME = 'useNvidiaGpu';

const NvidiaGpuLabel = ({ disabledReason }: { disabledReason?: string }) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>Install NVIDIA GPU </span>
      </Tooltip>
      <PopoverIcon
        id={NVIDIAGPU_FIELD_NAME}
        component={'a'}
        bodyContent={'No additional requirements needed'}
      />
    </>
  );
};

const NvidiaGpuHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Automate the management of NVIDIA software components needed to provision and monitor GPUs.{' '}
      </HelperTextItem>
    </HelperText>
  );
};

const NvidiaGpuCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const fieldId = getFieldId(NVIDIAGPU_FIELD_NAME, 'input');
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={NVIDIAGPU_FIELD_NAME}
        label={<NvidiaGpuLabel disabledReason={disabledReason} />}
        helperText={<NvidiaGpuHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default NvidiaGpuCheckbox;
