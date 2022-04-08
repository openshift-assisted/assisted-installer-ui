import React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { ClusterDetailsValues } from '../../clusterWizard/types';
import {
  Button,
  ButtonVariant,
  Stack,
  StackItem,
  TextInputTypes,
  Tooltip,
} from '@patternfly/react-core';
import { MinusCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { InputField } from '../../ui';

export const TangServers: React.FC<{ isDisabled?: boolean }> = ({ isDisabled = false }) => {
  const REMOVE_TANG_SERVER_SHOWN_TIMER = 1500;

  const { values } = useFormikContext<ClusterDetailsValues>();

  return (
    <FieldArray name="diskEncryptionTangServers">
      {({ remove, push }) => (
        <Stack hasGutter>
          {values.diskEncryptionTangServers.length > 0 &&
            values.diskEncryptionTangServers.map((tang, index) => (
              <StackItem key={index}>
                <Tooltip
                  key={index}
                  hidden={index === 0 || isDisabled}
                  exitDelay={REMOVE_TANG_SERVER_SHOWN_TIMER}
                  flipBehavior={['right', 'bottom']}
                  distance={1}
                  className="tooltip-tang-servers"
                  position="right-start"
                  content={
                    <Button
                      variant={ButtonVariant.link}
                      onClick={() => {
                        remove(index);
                      }}
                    >
                      <MinusCircleIcon size="sm" />
                    </Button>
                  }
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
                </Tooltip>{' '}
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
