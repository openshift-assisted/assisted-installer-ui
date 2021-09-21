import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, NumberInput, NumberInputProps, Split, SplitItem } from '@patternfly/react-core';
import { NumberInputFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';

const NumberInputField: React.FC<NumberInputFieldProps> = React.forwardRef(
  (
    {
      label,
      labelIcon,
      helperText,
      isRequired,
      validate,
      idPostfix,
      minValue = 0,
      maxValue,
      children,
      formatValue,
      ...props
    },
    ref: React.Ref<HTMLInputElement>,
  ) => {
    const [field, { touched, error }, { setValue }] = useField({ name: props.name, validate });
    const fieldId = getFieldId(props.name, 'numberinput', idPostfix);
    const isValid = !(touched && error);
    const errorMessage = !isValid ? error : '';

    const doChange = (value: number) => {
      let newValue = value < minValue ? minValue : value;
      newValue = maxValue && newValue > maxValue ? maxValue : newValue;
      setValue(formatValue ? formatValue(newValue) : newValue);
    };

    const onPlus: NumberInputProps['onPlus'] = () => {
      doChange(field.value + 1);
    };

    const onMinus: NumberInputProps['onMinus'] = () => {
      doChange(field.value - 1);
    };

    const handleChange: NumberInputProps['onChange'] = (event) => {
      const targetValue = event.target['value'];
      doChange(isNaN(targetValue) ? 0 : Number(targetValue));
    };

    return (
      <FormGroup
        fieldId={fieldId}
        label={label}
        helperText={
          typeof helperText === 'string' ? (
            helperText
          ) : (
            <HelperText fieldId={fieldId}>{helperText}</HelperText>
          )
        }
        helperTextInvalid={errorMessage}
        validated={isValid ? 'default' : 'error'}
        isRequired={isRequired}
        labelIcon={labelIcon}
      >
        <Split>
          <SplitItem isFilled>
            <NumberInput
              {...props}
              value={field.value}
              onMinus={onMinus}
              onChange={handleChange}
              onPlus={onPlus}
              min={minValue}
              max={maxValue}
              ref={ref}
              id={fieldId}
              aria-describedby={`${fieldId}-helper`}
            />
          </SplitItem>
          <SplitItem>{children}</SplitItem>
        </Split>
      </FormGroup>
    );
  },
);

export default NumberInputField;
