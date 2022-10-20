import React from 'react';
import { FormGroup } from '@patternfly/react-core';
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
      {SupportedCpuArchitectures.map((cpuArch) => (
        <RadioField
          name={GROUP_NAME}
          label={cpuArch}
          id={`cpu-arch_${cpuArch}`}
          value={cpuArch}
          key={cpuArch}
        />
      ))}
    </FormGroup>
  );
};

export default DiscoverImageCpuArchitectureControlGroup;
