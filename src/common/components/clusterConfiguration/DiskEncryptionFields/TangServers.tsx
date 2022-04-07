import React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { ClusterDetailsValues } from '../../clusterWizard/types';
import { Stack, StackItem, TextInputTypes } from '@patternfly/react-core';
import { InputField } from '../../ui';
import { AddButton, RemovableField } from '../../ui/formik';

export const TangServers: React.FC<{ isDisabled?: boolean }> = ({ isDisabled = false }) => {
  const { values } = useFormikContext<ClusterDetailsValues>();

  return (
    <FieldArray name="diskEncryptionTangServers">
      {({ remove, push }) => (
        <Stack hasGutter>
          {values.diskEncryptionTangServers.length > 0 &&
            values.diskEncryptionTangServers.map((tang, index) => (
              <StackItem key={index}>
                <RemovableField
                  showRemoveButton={index === 0 || isDisabled}
                  onRemove={() => remove(index)}
                >
                  <div>
                    <InputField
                      type={TextInputTypes.url}
                      name={`diskEncryptionTangServers.${index}.url`}
                      placeholder="http//tang.srv"
                      label="Server URL"
                      isRequired
                      isDisabled={isDisabled}
                    />
                    &thinsp;
                    <InputField
                      type={TextInputTypes.text}
                      name={`diskEncryptionTangServers.${index}.thumbprint`}
                      label="Server Thumbprint"
                      isRequired
                      isDisabled={isDisabled}
                    />
                  </div>
                </RemovableField>{' '}
              </StackItem>
            ))}

          {!isDisabled && (
            <StackItem>
              <AddButton onAdd={() => push({ url: '', thumbprint: '' })} isInline>
                Add another Tang server
              </AddButton>
            </StackItem>
          )}
        </Stack>
      )}
    </FieldArray>
  );
};
