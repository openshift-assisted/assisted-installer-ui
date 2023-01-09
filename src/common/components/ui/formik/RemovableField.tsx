import React from 'react';
import { Button, ButtonVariant, Tooltip, TooltipProps } from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons';
import './RemovableField.css';
import classnames from 'classnames';

interface RemovableFieldProps {
  onRemove: VoidFunction;
  hideRemoveButton?: boolean;
  removeButtonDataTestId?: string;
}

const REMOVE_BUTTON_EXIT_DELAY = 1500;

const RemovableField: React.FC<RemovableFieldProps & Omit<TooltipProps, 'content'>> = ({
  onRemove,
  hideRemoveButton = true,
  children,
  className,
  removeButtonDataTestId,
  ...props
}) => {
  return (
    <Tooltip
      hidden={hideRemoveButton}
      exitDelay={REMOVE_BUTTON_EXIT_DELAY}
      flipBehavior={['right', 'bottom']}
      position="right-start"
      distance={0}
      content={
        <Button
          variant={ButtonVariant.plain}
          onClick={onRemove}
          data-testid={removeButtonDataTestId}
        >
          <MinusCircleIcon size="sm" />
        </Button>
      }
      className={classnames('ai-remove-button__tooltip ', className)}
      {...props}
    >
      {children}
    </Tooltip>
  );
};

export default RemovableField;
