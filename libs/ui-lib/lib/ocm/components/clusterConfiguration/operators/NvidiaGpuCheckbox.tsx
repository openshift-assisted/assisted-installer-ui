import React from 'react';
import { FormGroup, HelperText, HelperTextItem, Tooltip } from '@patternfly/react-core';
import { getFieldId, getNvidiaGpuLink, PopoverIcon } from '../../../../common';
import { OcmCheckboxField } from '../../ui/OcmFormFields';
import { SupportLevel } from '@openshift-assisted/types/./assisted-installer-service';
import NewFeatureSupportLevelBadge from '../../../../common/components/newFeatureSupportLevels/NewFeatureSupportLevelBadge';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/js/icons/external-link-alt-icon';

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
        <span>NVIDIA GPU </span>
      </Tooltip>
      <PopoverIcon
        id={NVIDIAGPU_FIELD_NAME}
        headerContent="Additional requirements"
        component={'a'}
        bodyContent={'Requires at least one supported NVIDIA GPU'}
      />
      <NewFeatureSupportLevelBadge featureId="NVIDIA_GPU" supportLevel={supportLevel} />
    </>
  );
};

const NvidiaGpuHelperText = ({ openshiftVersion }: { openshiftVersion?: string }) => {
  return (
    <HelperText>
      <HelperTextItem variant="indeterminate">
        Automate the management of NVIDIA software components needed to provision and monitor GPUs.{' '}
        <a href={getNvidiaGpuLink(openshiftVersion)} target="_blank" rel="noopener noreferrer">
          {'Learn more'} <ExternalLinkAltIcon />
        </a>
      </HelperTextItem>
    </HelperText>
  );
};

const NvidiaGpuCheckbox = ({
  disabledReason,
  supportLevel,
  openshiftVersion,
}: {
  disabledReason?: string;
  supportLevel?: SupportLevel | undefined;
  openshiftVersion?: string;
}) => {
  const fieldId = getFieldId(NVIDIAGPU_FIELD_NAME, 'input');

  return (
    <FormGroup isInline fieldId={fieldId}>
      <OcmCheckboxField
        name={NVIDIAGPU_FIELD_NAME}
        label={<NvidiaGpuLabel disabledReason={disabledReason} supportLevel={supportLevel} />}
        helperText={<NvidiaGpuHelperText openshiftVersion={openshiftVersion || '4.17'} />}
        isDisabled={!!disabledReason}
      />
    </FormGroup>
  );
};

export default NvidiaGpuCheckbox;
