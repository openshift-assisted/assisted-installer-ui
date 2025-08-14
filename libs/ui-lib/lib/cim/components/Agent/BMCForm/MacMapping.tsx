import React from 'react';
import { FieldArray, FormikErrors, useField, useFormikContext } from 'formik';
import { getFieldId, InputField, useTranslation } from '../../../../common';
import { Button, FormGroup, Grid, GridItem, Text, TextVariants } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import MinusCircleIcon from '@patternfly/react-icons/dist/js/icons/minus-circle-icon';
import { AddBmcValues } from '../types';

type MacMappingFieldProps = { macAddress: string; name: string }[];

const getFieldError = (errors: FormikErrors<AddBmcValues>, fieldName: string): string => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return errors[fieldName]?.[0] || '';
};

export const MacMapping = () => {
  const [field] = useField<MacMappingFieldProps>({
    name: 'macMapping',
  });
  const { errors } = useFormikContext<AddBmcValues>();
  const fieldId = getFieldId('macMapping', 'input');
  const { t } = useTranslation();

  return (
    <FormGroup fieldId={fieldId} label={t('ai:MAC to interface name mapping')}>
      <FieldArray
        name="macMapping"
        render={({ push, remove }) => (
          <Grid hasGutter>
            <GridItem span={5}>
              <Text component={TextVariants.small}>MAC address</Text>
            </GridItem>
            <GridItem span={5}>
              <Text component={TextVariants.small}>NIC</Text>
            </GridItem>
            {field.value.map((mac, index) => {
              const macField = `macMapping[${index}].macAddress`;
              const nameField = `macMapping[${index}].name`;
              return (
                <React.Fragment key={index}>
                  <GridItem span={5}>
                    <InputField name={macField} inputError={getFieldError(errors, macField)} />
                  </GridItem>
                  <GridItem span={5}>
                    <InputField name={nameField} inputError={getFieldError(errors, nameField)} />
                  </GridItem>
                  {index !== 0 && (
                    <GridItem span={2}>
                      <MinusCircleIcon onClick={() => remove(index)} />
                    </GridItem>
                  )}
                </React.Fragment>
              );
            })}
            <GridItem span={6}>
              <Button
                icon={<PlusCircleIcon />}
                onClick={() => push({ macAddress: '', name: '' })}
                variant="link"
                isInline
              >
                {t('ai:Add more')}
              </Button>
            </GridItem>
          </Grid>
        )}
      />
    </FormGroup>
  );
};
