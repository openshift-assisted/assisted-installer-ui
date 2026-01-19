import { Button, ButtonProps, ButtonVariant } from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons/dist/js/icons/plus-circle-icon';
import React from 'react';

interface AddButtonProps {
  onAdd: VoidFunction;
}

const AddButton: React.FC<AddButtonProps & ButtonProps> = ({
  onAdd,
  variant = ButtonVariant.link,
  children,
  ...props
}) => {
  return (
    <Button icon={<PlusCircleIcon />} onClick={onAdd} variant={variant} {...props}>
      {children}
    </Button>
  );
};

export default AddButton;
