import { Flex, FlexItem, Label, StackItem } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';
import { useField } from 'formik';
import React from 'react';
import { CustomManifestValues } from '../data/dataTypes';
import { CustomManifestComponentProps } from './propTypes';

const CollapsedManifest = ({ manifestIdx, fieldName }: CustomManifestComponentProps) => {
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
                  Missing information
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
