import React, { useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { useNewFeatureSupportLevel } from '../../../../common/components/newFeatureSupportLevels';
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
        bodyContent={'Requires at least one supported NVIDIA GPU'}
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

const NvidiaGpuCheckbox = ({ disabledReason }: { disabledReason?: string }) => {
  const fieldId = getFieldId(NVIDIAGPU_FIELD_NAME, 'input');
  const featureSupportLevel = useNewFeatureSupportLevel();
  const [disabledReasonNvidia, setDisabledReason] = useState<string | undefined>();

  React.useEffect(() => {
    const reason = featureSupportLevel.getFeatureDisabledReason('NVIDIA_GPU');
    setDisabledReason(reason);
  }, [featureSupportLevel]);
  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={NVIDIAGPU_FIELD_NAME}
        label={
          <NvidiaGpuLabel
            disabledReason={disabledReason ? disabledReason : disabledReasonNvidia}
            supportLevel={featureSupportLevel.getFeatureSupportLevel('NVIDIA_GPU')}
          />
        }
        helperText={<NvidiaGpuHelperText />}
        isDisabled={!!disabledReason || !!disabledReasonNvidia}
      />
    </FormGroup>
  );
};

export default NvidiaGpuCheckbox;
