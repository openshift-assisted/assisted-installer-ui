import React from 'react';
import { load } from 'js-yaml';
import { Flex, FlexItem, Label, StackItem } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { useField } from 'formik';
import { CustomManifestValues } from './types';
import { CustomManifestComponentProps } from './propTypes';
import { useTranslation } from '../../hooks';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

const getManifestLabel = (value: CustomManifestValues, yamlOnly?: boolean) => {
  if (!yamlOnly && value.filename) {
    return `${value.folder}/${value.filename}`;
  } else {
    try {
      const filename = (load(value.manifestYaml) as K8sResourceCommon).metadata?.name;
      return filename;
    } catch (error) {
      return;
    }
  }
};

const CollapsedManifest = ({ manifestIdx, fieldName, yamlOnly }: CustomManifestComponentProps) => {
  const { t } = useTranslation();
  const [{ value }, { error }] = useField<CustomManifestValues>({
    name: fieldName,
  });

  const label = getManifestLabel(value, yamlOnly);

  return (
    <>
      <StackItem data-testid={`collapsed-manifest-${manifestIdx}`}>
        <Flex>
          {error && (
            <>
              <FlexItem>
                <Label
                  variant="outline"
                  color="red"
                  icon={<InfoCircleIcon />}
                  data-testid="manifest-errors-label"
                >
                  {t('ai:Missing information')}
                </Label>
              </FlexItem>
            </>
          )}
          {!error && label && (
            <>
              <FlexItem>
                <Label variant="outline" data-testid="manifest-name">
                  {label}
                </Label>{' '}
              </FlexItem>
            </>
          )}
        </Flex>
      </StackItem>
    </>
  );
};

export default CollapsedManifest;
