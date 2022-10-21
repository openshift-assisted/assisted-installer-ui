import React from 'react';
import { Flex, FlexItem, FormGroup } from '@patternfly/react-core';
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
      <Flex>
        {SupportedCpuArchitectures.map((cpuArch) => (
          <FlexItem key={cpuArch}>
            <RadioField
              id={`cpu-arch_${cpuArch}`}
              name={GROUP_NAME}
              label={cpuArch}
              value={cpuArch}
            />
          </FlexItem>
        ))}
      </Flex>
    </FormGroup>
  );
};

export default DiscoverImageCpuArchitectureControlGroup;
