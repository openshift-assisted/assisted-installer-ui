import React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { ClusterDetailsValues } from '../../clusterWizard/types';
import { Button, Stack, StackItem, TextInputTypes } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { InputField } from '../../ui';
import { RemovableField } from '../../ui/formik';

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
                  index={index}
                  showRemoveButton={index === 0 || isDisabled}
                  remove={remove}
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
              <Button
                variant={ButtonVariant.link}
                onClick={() => push({ url: '', thumbprint: '' })}
                isInline
              >
                <PlusCircleIcon size="sm" hidden={isDisabled} />
                &nbsp;Add another Tang server
              </Button>
            </StackItem>
          )}
        </Stack>
      )}
    </FieldArray>
  );
};
