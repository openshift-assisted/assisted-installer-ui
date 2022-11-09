import React from 'react';
import { FormGroup, Flex, FlexItem, TextContent, Text, TextVariants } from '@patternfly/react-core';
import { DetailItem, DetailList, getFieldId, RadioField } from '../ui';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { CpuArchitecture, SupportedCpuArchitectures } from '../../types';
import { FeatureSupportLevelBadge } from '../featureSupportLevels';
import { Cluster } from '../../api';

const GROUP_NAME = 'cpuArchitecture';

const DiscoverImageCpuArchitectureControlGroup = ({
  canSelectCpuArchitecture,
  day1CpuArchitecture,
  openshiftVersion,
}: {
  canSelectCpuArchitecture: boolean;
  day1CpuArchitecture: CpuArchitecture | undefined;
  openshiftVersion: Cluster['openshiftVersion'];
}) => {
  const { t } = useTranslation();

  if (!canSelectCpuArchitecture) {
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
    <FormGroup
      isInline
      fieldId={getFieldId(GROUP_NAME, 'radio')}
      label={
        <TextContent>
          <Text component={TextVariants.h4}>
            {t('ai:CPU architecture')}
            <FeatureSupportLevelBadge
              featureId="MULTIARCH_RELEASE_IMAGE"
              openshiftVersion={openshiftVersion}
            />
          </Text>
        </TextContent>
      }
    >
      <Flex>
        {SupportedCpuArchitectures.map((cpuArch) => {
          return (
            <FlexItem key={cpuArch}>
              <RadioField
                key={cpuArch}
                id={`cpu-arch_${cpuArch}`}
                name={GROUP_NAME}
                label={cpuArch}
                value={cpuArch}
                data-testid={`cpu-arch_${cpuArch}`}
              />
            </FlexItem>
          );
        })}
      </Flex>
    </FormGroup>
  );
};

export default DiscoverImageCpuArchitectureControlGroup;
