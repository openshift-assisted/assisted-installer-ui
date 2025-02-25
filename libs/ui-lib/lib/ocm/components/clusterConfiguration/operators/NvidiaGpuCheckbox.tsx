import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';

const NVIDIAGPU_FIELD_NAME = 'useNvidiaGpu';

const NvidiaGpuLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
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
      <NewFeatureSupportLevelBadge featureId="NVIDIA_GPU" supportLevel={supportLevel} />
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

const NvidiaGpuCheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(NVIDIAGPU_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={NVIDIAGPU_FIELD_NAME}
        label={<NvidiaGpuLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        helperText={<NvidiaGpuHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default NvidiaGpuCheckbox;
