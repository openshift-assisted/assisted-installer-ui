import { RadioField } from '../ui';
import { FormGroup } from '@patternfly/react-core';
import React from 'react';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { CpuArchitecture } from '../../types';

const GROUP_NAME = 'cpuArchitecture';

const DiscoverImageCpuArchitectureControlGroup = ({
  cpuArchitectures,
}: {
  cpuArchitectures: CpuArchitecture[];
}) => {
  const { t } = useTranslation();
  return (
    <FormGroup
      role={'radiogroup'}
      isInline
      fieldId={'cpu-architecture-control-group'}
      label={t('ai:CPU architecture')}
    >
      {cpuArchitectures.map((cpuArch) => (
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
