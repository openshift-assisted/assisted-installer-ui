import React from 'react';
import { Button, ButtonVariant, Tooltip, TooltipProps } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import './RemovableField.css';
import classnames from 'classnames';

interface RemovableFieldProps {
  onRemove: VoidFunction;
  showRemoveButton?: boolean;
}

const REMOVE_BUTTON_EXIT_DELAY = 1500;

const RemovableField: React.FC<RemovableFieldProps & Omit<TooltipProps, 'content'>> = ({
  onRemove,
  showRemoveButton = true,
  children,
  className,
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
        <Button variant={ButtonVariant.plain} onClick={onRemove}>
          <MinusCircleIcon size="sm" />
        </Button>
      }
      className={classnames('remove-button--tooltip ', className)}
      {...props}
    >
      {children}
    </Tooltip>
  );
};

export default RemovableField;
