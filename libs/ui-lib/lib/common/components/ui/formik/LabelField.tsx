import * as React from 'react';
import { useField } from 'formik';
import {
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Label,
} from '@patternfly/react-core';
import TagsInput from 'react-tagsinput';
import { InputFieldProps } from './types';
import { getFieldId } from './utils';

import './LabelField.css';
import { useTranslation } from '../../../hooks/use-translation-wrapper';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';

type LabelValueProps = {
  value: React.ReactText;
  onClose?: () => void;
};

export const LabelValue: React.FC<LabelValueProps> = ({ value, onClose }) => (
  <Label className="label-field__value" variant="outline" onClose={onClose}>
    {value}
  </Label>
);

type LabelFieldProps = InputFieldProps & {
  // eslint-disable-next-line
  onChange?: (tags: any[]) => void;
};

export const LabelField: React.FC<LabelFieldProps> = ({
  label,
  labelIcon,
  helperText,
  isRequired,
  onChange,
  validate,
  idPostfix,
  ...props
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
      {t("ai:Enter key=value and then press 'enter' or 'space' or use a ',' to input the label.")}
      <div className="co-search-input pf-v5-c-form-control">
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
            <LabelValue key={key} onClose={() => onRemove(key)} value={getTagDisplayValue(tag)} />
          )}
          addOnBlur
          inputProps={{
            autoFocus: false,
            className: 'label-field__input',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            placeholder: field.value?.length ? '' : 'app=frontend',
            spellCheck: 'false',
            id: 'tags-input',
            value: input,
            // eslint-disable-next-line
            onChange: (e: any) => setInput(e.target.value),
            ['data-test']: 'tags-input',
          }}
        />
      </div>
      {(errorMessage || helperText) && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              icon={errorMessage && <ExclamationCircleIcon />}
              variant={errorMessage ? 'error' : 'default'}
              id={errorMessage ? `${fieldId}-helper-error` : `${fieldId}-helper`}
            >
              {errorMessage ? errorMessage : helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};
