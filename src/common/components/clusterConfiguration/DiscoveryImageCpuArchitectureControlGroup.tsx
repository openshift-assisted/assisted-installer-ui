import React from 'react';
import { Flex, FlexItem, FormGroup } from '@patternfly/react-core';
import { getFieldId, RadioField } from '../ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { CpuArchitecture, SupportedCpuArchitectures } from '../../types';

const GROUP_NAME = 'cpuArchitecture';

const DiscoverImageCpuArchitectureControlGroup = ({
  isMultiArchitecture,
  day1CpuArchitecture,
}: {
  isMultiArchitecture: boolean;
  day1CpuArchitecture: CpuArchitecture | undefined;
}) => {
  const { t } = useTranslation();
  return (
    <FormGroup
      role={'radiogroup'}
      isInline
      fieldId={getFieldId(GROUP_NAME, 'radio')}
      label={t('ai:CPU architecture')}
    >
      <Flex>
        {SupportedCpuArchitectures.map((cpuArch) => {
          if (!isMultiArchitecture && cpuArch !== day1CpuArchitecture) {
            return null;
          }
          return (
            <FlexItem key={cpuArch}>
              <RadioField
                id={`cpu-arch_${cpuArch}`}
                name={GROUP_NAME}
                label={cpuArch}
                value={cpuArch}
              />
            </FlexItem>
          );
        })}
      </Flex>
    </FormGroup>
  );
};

export default DiscoverImageCpuArchitectureControlGroup;
