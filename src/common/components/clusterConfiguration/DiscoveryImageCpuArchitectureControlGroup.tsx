import React from 'react';
import { FormGroup, Stack, StackItem } from '@patternfly/react-core';
import { getFieldId, RadioField } from '../ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { SupportedCpuArchitectures } from '../../types';

const GROUP_NAME = 'cpuArchitecture';

const DiscoverImageCpuArchitectureControlGroup = () => {
  const { t } = useTranslation();
  return (
    <FormGroup
      role={'radiogroup'}
      isInline
      fieldId={getFieldId(GROUP_NAME, 'radio')}
      label={t('ai:CPU architecture')}
    >
      <Stack hasGutter>
        {SupportedCpuArchitectures.map((cpuArch) => {
          <StackItem>
            <RadioField
              name={GROUP_NAME}
              label={cpuArch}
              id={`cpu-arch_${cpuArch}`}
              value={cpuArch}
              key={cpuArch}
            />
          </StackItem>;
        })}
      </Stack>
    </FormGroup>
  );
};

export default DiscoverImageCpuArchitectureControlGroup;
