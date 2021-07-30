import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, Label } from '@patternfly/react-core';
import TagsInput from 'react-tagsinput';
import Autosuggest from 'react-autosuggest';
import { InputFieldProps } from './types';
import { getFieldId, uniqueLabels } from './utils';
import HelperText from './HelperText';

import './LabelField.css';

const NEW_KEY = ' (new key)';
const noop = () => {
  return;
};

type LabelValueProps = {
  value: React.ReactText;
  onClose?: () => void;
};

export const LabelValue: React.FC<LabelValueProps> = ({ value, onClose }) => (
  <Label className="label-field__value" variant="outline" onClose={onClose}>
    {value}
  </Label>
);

type LabelFieldProps = Omit<InputFieldProps, 'onChange'> & {
  // eslint-disable-next-line
  onChange?: (tags: any[]) => void;
  autocompleteValues?: string[];
  // Keep keys unique. Later key wins.
  forceUniqueKeys?: boolean;
};

export const LabelField: React.FC<LabelFieldProps> = ({
  label,
  labelIcon,
  helperText,
  isRequired,
  onChange,
  validate,
  idPostfix,
  forceUniqueKeys,
  autocompleteValues = [],
  ...props
}) => {
  const [input, setInput] = React.useState('');
  const [field, { touched, error }, { setValue, setTouched }] = useField({
    name: props.name,
    validate,
  });
  const fieldId = getFieldId(props.name, 'input', idPostfix);
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';

  // TODO(mlibra): Use Patternfly component once available, sort of
  // https://patternflyelements.org/components/autocomplete/
  const autocompleteRenderInput = React.useMemo(
    (): TagsInput.ReactTagsInputProps['renderInput'] => (props) => {
      const trimmedInput = input?.trim();
      let suggestions: string[] = [];
      if (trimmedInput && !trimmedInput.includes('=')) {
        suggestions = autocompleteValues.filter((suggestion) =>
          suggestion.startsWith(trimmedInput),
        );
        if (!autocompleteValues.includes(input)) {
          suggestions.push(`${input}${NEW_KEY}`);
        }
      }

      const sections = [
        // We have just a single section to highlight the "key"
        {
          title: 'key',
          suggestions,
        },
      ];

      const shouldRenderSuggestions = (value: string): boolean => {
        return value?.trim()?.length > 0 && !value.includes('=');
      };

      const renderSectionTitle = (section: { title: string }) => {
        return <>{section.title}</>;
      };

      const getSectionSuggestions = (section: { suggestions: string[] }) => {
        return section.suggestions;
      };

      const renderSuggestion = (suggestion: string) => (
        <>
          {input}
          {suggestion.includes(NEW_KEY) ? (
            <>{NEW_KEY}</>
          ) : (
            <b>{suggestion.substring(input?.length || 0)}</b>
          )}
        </>
      );

      const inputProps: Autosuggest.InputProps<string> = {
        ...props,
        onChange: (e, { method }) => {
          if (method === 'enter') {
            e.preventDefault();
          } else {
            const event = (e as unknown) as React.ChangeEvent<{ readonly value: string }>;
            props.onChange(event);
          }
        },
      };
      delete inputProps['addTag'];

      return (
        <Autosuggest
          ref={props.ref}
          multiSection={true}
          renderSectionTitle={renderSectionTitle}
          getSectionSuggestions={getSectionSuggestions}
          suggestions={sections}
          shouldRenderSuggestions={shouldRenderSuggestions}
          getSuggestionValue={(suggestion) => suggestion}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
          onSuggestionSelected={(e, data) => {
            const value = data.suggestion.split(NEW_KEY)[0];
            setInput(`${value}=`);
          }}
          onSuggestionsClearRequested={noop}
          onSuggestionsFetchRequested={noop}
        />
      );
    },
    [autocompleteValues, input],
  );

  console.log(
    '--- isValid: ',
    isValid,
    ', errorMessage: ',
    errorMessage,
    ', isRequired: ',
    isRequired,
  );

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
      Enter key=value and then press 'enter' or 'space' or use a ',' to input the label.
      <div className="co-search-input pf-c-form-control label-field">
        <TagsInput
          {...field}
          onChange={(allTags) => {
            const tags: string[] = forceUniqueKeys ? uniqueLabels(allTags) : allTags;
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
            placeholder: field.value?.length ? '' : 'app=frontend',
            spellCheck: 'false',
            id: 'tags-input',
            value: input,
            // eslint-disable-next-line
            onChange: (e: any) => setInput(e.target.value),
            ['data-test']: 'tags-input',
          }}
          renderInput={autocompleteRenderInput}
        />
      </div>
    </FormGroup>
  );
};
