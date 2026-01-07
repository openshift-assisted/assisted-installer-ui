import * as React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Label,
  TextInput,
} from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import TagsInput from 'react-tagsinput';
import { InputFieldProps } from './types';
import { getFieldId } from './utils';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

export const LabelField = ({
  label,
  labelIcon,
  helperText,
  isRequired,
  onChange,
  validate,
  idPostfix,
  ...props
}: InputFieldProps & {
  // eslint-disable-next-line
  onChange?: (tags: any[]) => void;
}) => {
  const { t } = useTranslation();
  const [input, setInput] = React.useState('');
  const [field, { touched, error }, { setValue, setTouched }] = useField({
    name: props.name,
    validate,
  });
  const fieldId = getFieldId(props.name, 'input', idPostfix);
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';

  return (
    <FormGroup fieldId={fieldId} label={label} isRequired={isRequired} labelHelp={labelIcon}>
      <TagsInput
        {...field}
        onChange={(tags) => {
          setValue(tags);
          setInput('');
          onChange && onChange(tags);
          !touched && setTouched(true);
        }}
        addKeys={[13, 32, 188]}
        renderTag={({ tag, key, onRemove, getTagDisplayValue }) => (
          <Label key={key} style={{ margin: 2 }} onClose={() => onRemove(key)}>
            {getTagDisplayValue(tag)}
          </Label>
        )}
        renderInput={({ value, onChange, ...rest }) => (
          <TextInput
            onChange={onChange as (e: unknown) => void}
            value={value as string}
            {...rest}
          />
        )}
        renderLayout={(tagElements, inputElement) => (
          <div
            className="pf-v6-c-form-control"
            style={{
              padding: 0,
              paddingTop: '1px',
              display: 'flex',
              alignItems: 'start',
              flexWrap: 'wrap',
              height: 'unset',
              minHeight: '36px',
            }}
          >
            <div>{tagElements}</div>
            {inputElement}
          </div>
        )}
        addOnBlur
        inputProps={{
          autoFocus: false,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          placeholder: field.value?.length ? '' : 'app=frontend',
          spellCheck: 'false',
          value: input,
          // eslint-disable-next-line
          onChange: (e: any) => setInput(e.target.value),
          ['data-test']: fieldId,
        }}
      />

      <FormHelperText>
        <HelperText>
          <HelperTextItem
            id={`${fieldId}-helper-text`}
            data-testid={`input-label-${fieldId}-helper-text`}
          >
            {helperText ||
              t(
                "ai:Enter a key=value and then press 'enter' or 'space' or use a ',' to input the label.",
              )}
          </HelperTextItem>
          {errorMessage && (
            <HelperTextItem
              icon={<ExclamationCircleIcon />}
              variant={'error'}
              id={`${fieldId}-helper-error`}
              data-testid={`input-label-${fieldId}-helper-error`}
            >
              {errorMessage}
            </HelperTextItem>
          )}
        </HelperText>
      </FormHelperText>
    </FormGroup>
  );
};
