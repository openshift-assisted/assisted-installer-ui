import { Button, ButtonProps, ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { FieldArrayRenderProps } from 'formik';
import React from 'react';

interface AddButtonProps {
  add: FieldArrayRenderProps['push'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addValue: any;
}

const AddButton: React.FC<AddButtonProps & ButtonProps> = ({
  add,
  addValue,
  variant = ButtonVariant.link,
  children,
  ...props
}) => {
  return (
    <Button
      icon={<PlusCircleIcon />}
      onClick={() => {
        add(addValue);
      }}
      variant={variant}
      {...props}
    >
      {children}
    </Button>
  );
};

export default AddButton;
