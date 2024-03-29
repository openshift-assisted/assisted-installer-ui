import React from 'react';
import { FieldArray, useFormikContext } from 'formik';
import { Stack, StackItem, TextInputTypes, Tooltip, TooltipProps } from '@patternfly/react-core';
import { ClusterDetailsValues } from '../../clusterWizard';
import { InputField } from '../../ui';
import { AddButton, RemovableField } from '../../ui/formik';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

export const TangServers = ({
  isDisabled = false,
  tooltipProps,
}: {
  isDisabled: boolean;
  tooltipProps: TooltipProps;
}) => {
  const { values } = useFormikContext<ClusterDetailsValues>();
  const { t } = useTranslation();
  return (
    <FieldArray name="diskEncryptionTangServers">
      {({ remove, push }) => (
        <Stack hasGutter>
          {values.diskEncryptionTangServers.map((tang, index) => (
            <StackItem key={index}>
              <RemovableField
                hideRemoveButton={index === 0 || isDisabled}
                onRemove={() => remove(index)}
              >
                <div>
                  <Tooltip {...tooltipProps}>
                    <InputField
                      type={TextInputTypes.url}
                      name={`diskEncryptionTangServers.${index}.url`}
                      helperText={`Must start with "http://" or "https://". Optionally, end with ":<port>"`}
                      label="Server URL"
                      isRequired
                      isDisabled={isDisabled}
                    />
                  </Tooltip>
                  &thinsp;
                  <Tooltip {...tooltipProps}>
                    <InputField
                      type={TextInputTypes.text}
                      name={`diskEncryptionTangServers.${index}.thumbprint`}
                      label="Server Thumbprint"
                      isRequired
                      isDisabled={isDisabled}
                    />
                  </Tooltip>
                </div>
              </RemovableField>{' '}
            </StackItem>
          ))}

          {!isDisabled && (
            <StackItem>
              <AddButton onAdd={() => push({ url: '', thumbprint: '' })} isInline>
                {t('ai:Add another Tang server')}
              </AddButton>
            </StackItem>
          )}
        </Stack>
      )}
    </FieldArray>
  );
};
