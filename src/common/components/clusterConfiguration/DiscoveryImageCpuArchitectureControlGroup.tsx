import React from 'react';
import { FormGroup } from '@patternfly/react-core';
import { DetailItem, DetailList, getFieldId, RadioField } from '../ui';
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

  if (!isMultiArchitecture) {
    return (
      <DetailList>
        <DetailItem
          title={t('ai:CPU architecture')}
          value={day1CpuArchitecture}
          testId="cpu-architecture"
        />
      </DetailList>
    );
  }

  return (
    <FormGroup isInline fieldId={getFieldId(GROUP_NAME, 'radio')} label={t('ai:CPU architecture')}>
      {SupportedCpuArchitectures.map((cpuArch) => {
        return (
          <RadioField
            key={cpuArch}
            id={`cpu-arch_${cpuArch}`}
            name={GROUP_NAME}
            label={cpuArch}
            value={cpuArch}
            data-testid={`cpu-arch_${cpuArch}`}
          />
        );
      })}
    </FormGroup>
  );
};

export default DiscoverImageCpuArchitectureControlGroup;
