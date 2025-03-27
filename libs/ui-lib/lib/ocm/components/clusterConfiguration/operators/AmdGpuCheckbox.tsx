import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';

const AMDGPU_FIELD_NAME = 'useAmdGpu';

const AmdGpuLabel = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel;
}) => {
  return (
    <>
      <Tooltip hidden={!disabledReason} content={disabledReason}>
        <span>AMD GPU </span>
      </Tooltip>
      <PopoverIcon
        id={AMDGPU_FIELD_NAME}
        headerContent="Additional requirements"
        component={'a'}
        bodyContent={'Requires at least one supported AMD GPU'}
      />
      <NewFeatureSupportLevelBadge featureId="AMD_GPU" supportLevel={supportLevel} />
    </>
  );
};

const AmdGpuHelperText = () => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Automate the management of AMD software components needed to provision and monitor GPUs.{' '}
      </HelperTextItem>
    </HelperText>
  );
};

const AmdGpuCheckbox = ({
  disabledReason,
  supportLevel,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
}) => {
  const fieldId = getFieldId(AMDGPU_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={AMDGPU_FIELD_NAME}
        label={<AmdGpuLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        helperText={<AmdGpuHelperText />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default AmdGpuCheckbox;
