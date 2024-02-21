import * as React from 'react';
import {
  FormGroup,
  Button,
  FormHelperText,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import { TextAreaSecretProps } from './types';
import { getFieldId } from './utils';
import TextAreaField from './TextAreaField';

const TextAreaSecretField: React.FC<TextAreaSecretProps> = ({
  isSet,
  isEdit,
  helperTextHidden,
  onToggle,
  idPostfix,
  ...props
}) => {
  const { label, name } = props;
  const fieldId = getFieldId(name, 'input', idPostfix);

  if (isEdit) {
    return (
      <TextAreaField {...props}>
        {isSet && (
          <Button onClick={() => onToggle(true)} variant="link">
            Keep existing value
          </Button>
        )}
      </TextAreaField>
    );
  }

  return (
    <FormGroup fieldId={fieldId} label={label} isRequired={props.isRequired}>
      <Button onClick={() => onToggle(false)} variant="link">
        Change
      </Button>
      {helperTextHidden && (
        <FormHelperText>
          <HelperText>
            <HelperTextItem>{helperTextHidden}</HelperTextItem>
          </HelperText>
        </FormHelperText>
      )}
    </FormGroup>
  );
};

export default TextAreaSecretField;
