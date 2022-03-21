import React from 'react';
import { Button, ButtonVariant, Tooltip, TooltipProps } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import { FieldArrayRenderProps } from 'formik';
import './RemovableField.css';

interface RemovableFieldProps {
  index: number;
  remove: FieldArrayRenderProps['remove'];
  showRemoveButton?: boolean;
  buttonVariant?: ButtonVariant;
}

const REMOVE_BUTTON_EXIT_DELAY = 1500;

const RemovableField: React.FC<RemovableFieldProps & Partial<TooltipProps>> = ({
  remove,
  showRemoveButton = true,
  children,
  className,
  index,
  ...props
}) => {
  return (
    <Tooltip
      hidden={showRemoveButton}
      exitDelay={REMOVE_BUTTON_EXIT_DELAY}
      flipBehavior={['right', 'bottom']}
      position="right-start"
      distance={1}
      content={
        <Button variant={ButtonVariant.plain} onClick={() => remove(index)}>
          <MinusCircleIcon size="sm" />
        </Button>
      }
      className={'remove-button--tooltip ' + className}
      {...props}
    >
      {children}
    </Tooltip>
  );
};

export default RemovableField;
