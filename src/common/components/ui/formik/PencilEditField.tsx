import { useField } from 'formik';
import * as React from 'react';
import { PencilAltIcon } from '@patternfly/react-icons';
import InputField from './InputField';
import { Split, SplitItem } from '@patternfly/react-core';

import './PencilEditField.css';

const InputFieldFocus = ({
  name,
  isRequired,
  onBlur,
}: PencilEditFieldProps & { onBlur: VoidFunction }) => {
  const textInputRef = React.useRef<HTMLDivElement>();
  React.useEffect(() => textInputRef?.current?.focus(), []);
  return <InputField name={name} isRequired={isRequired} onBlur={onBlur} ref={textInputRef} />;
};

type PencilEditFieldProps = {
  name: string;
  isRequired: boolean;
};

const PencilEditField = ({ name, isRequired }: PencilEditFieldProps) => {
  const [edit, setEdit] = React.useState(false);
  const [field] = useField({ name });

  return edit ? (
    <InputFieldFocus name={name} isRequired={isRequired} onBlur={() => setEdit(false)} />
  ) : (
    <>
      <Split>
        <SplitItem className="ai-pencil-field__text">{field.value}</SplitItem>
        <SplitItem>
          <PencilAltIcon onClick={() => setEdit(true)} />
        </SplitItem>
      </Split>
    </>
  );
};

export default PencilEditField;
