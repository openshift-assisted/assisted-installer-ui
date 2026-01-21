import { useField } from 'formik';
import * as React from 'react';
import { PencilAltIcon } from '@patternfly/react-icons/dist/js/icons/pencil-alt-icon';
import InputField from './InputField';
import { Split, SplitItem } from '@patternfly/react-core';

import './PencilEditField.css';
import useFieldErrorMsg from '../../../hooks/useFieldErrorMsg';

const InputFieldFocus = ({
  name,
  isRequired,
  onBlur,
  showErrorMessage,
}: PencilEditFieldProps & { onBlur: VoidFunction; showErrorMessage?: boolean }) => {
  const textInputRef = React.useRef<HTMLDivElement>();
  React.useEffect(() => textInputRef?.current?.focus(), []);
  return (
    <InputField
      name={name}
      isRequired={isRequired}
      onBlur={onBlur}
      ref={textInputRef}
      showErrorMessage={showErrorMessage}
    />
  );
};

type PencilEditFieldProps = {
  name: string;
  isRequired: boolean;
  showErrorMessage?: boolean;
};

const PencilEditField = ({ name, isRequired, showErrorMessage }: PencilEditFieldProps) => {
  const [edit, setEdit] = React.useState(false);
  const [field] = useField({ name });

  const errrMsg = useFieldErrorMsg({ name });

  return (
    <>
      {edit ? (
        <InputFieldFocus
          name={name}
          isRequired={isRequired}
          onBlur={() => setEdit(false)}
          showErrorMessage={showErrorMessage}
        />
      ) : (
        <>
          <Split>
            <SplitItem className="ai-pencil-field__text">{field.value}</SplitItem>
            <SplitItem>
              <PencilAltIcon onClick={() => setEdit(true)} />
            </SplitItem>
          </Split>
        </>
      )}
      <div className="pf-v6-c-form__helper-text pf-m-error">{errrMsg}</div>
    </>
  );
};

export default PencilEditField;
