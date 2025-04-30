import React from 'react';
import { Flex, FlexItem, Label, StackItem } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons/dist/js/icons/info-circle-icon';
import { useField } from 'formik';
import { CustomManifestValues } from './types';
import { CustomManifestComponentProps } from './propTypes';
import { useTranslation } from '../../hooks';

const CollapsedManifest = ({ manifestIdx, fieldName }: CustomManifestComponentProps) => {
  const { t } = useTranslation();
  const [{ value }, { error }] = useField<CustomManifestValues>({
    name: fieldName,
  });

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
          {!error && value.filename && (
            <>
              <FlexItem>
                <Label
                  variant="outline"
                  data-testid="manifest-name"
                >{`${value.folder}/${value.filename}`}</Label>{' '}
              </FlexItem>
            </>
          )}
        </Flex>
      </StackItem>
    </>
  );
};

export default CollapsedManifest;
