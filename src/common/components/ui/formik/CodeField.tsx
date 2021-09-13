import * as React from 'react';
import { useField } from 'formik';
import { FormGroup, HelperTextItem } from '@patternfly/react-core';
import { CodeFieldProps } from './types';
import { getFieldId } from './utils';
import HelperText from './HelperText';
import { CodeEditor } from '@patternfly/react-code-editor';

const CodeField: React.FC<CodeFieldProps> = ({
  label,
  labelIcon,
  helperText,
  isRequired,
  validate,
  idPostfix,
  language,
  name,
  description,
}) => {
  const [field, { touched, error }, { setValue, setTouched }] = useField({ name, validate });
  const fieldId = getFieldId(name, 'input', idPostfix);
  const isValid = !(touched && error);
  const errorMessage = !isValid ? error : '';
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
      {description && (
        <HelperText fieldId={fieldId}>
          <HelperTextItem variant="indeterminate">{description}</HelperTextItem>
        </HelperText>
      )}
      <CodeEditor
        code={field.value}
        isUploadEnabled
        isDownloadEnabled
        isCopyEnabled
        isLanguageLabelVisible
        height="400px"
        language={language}
        onChange={(val) => {
          setTouched(true);
          setValue(val, true);
        }}
        onEditorDidMount={(editor) => {
          setTouched(true);
          setValue(editor.getValue(), true);
        }}
      />
    </FormGroup>
  );
};

export default CodeField;
