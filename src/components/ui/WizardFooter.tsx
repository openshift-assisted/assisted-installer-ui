import * as React from 'react';
import { ButtonVariant, Stack, StackItem, Toolbar, ToolbarContent } from '@patternfly/react-core';
import { ToolbarButton } from './Toolbar';

export type WizardFooterProps = {
  alerts?: React.ReactNode;
  errors?: React.ReactNode;
  leftExtraActions?: React.ReactNode;
  rightExtraActions?: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
};

const WizardFooter: React.FC<WizardFooterProps> = ({
  alerts,
  onNext,
  onBack,
  onCancel,
  isNextDisabled,
  isBackDisabled,
  errors,
}) => (
  <Stack hasGutter>
    {alerts && <StackItem>{alerts}</StackItem>}
    {errors && <StackItem>{errors}</StackItem>}
    <StackItem>
      <Toolbar data-testid="wizard-step-actions">
        <ToolbarContent>
          {onNext && (
            <ToolbarButton
              variant={ButtonVariant.primary}
              name="next"
              onClick={onNext}
              isDisabled={isNextDisabled}
            >
              Next
            </ToolbarButton>
          )}
          {onBack && (
            <ToolbarButton
              variant={ButtonVariant.secondary}
              name="back"
              onClick={onBack}
              isDisabled={isBackDisabled}
            >
              Back
            </ToolbarButton>
          )}
          <ToolbarButton
            variant={ButtonVariant.link}
            name="cancel"
            onClick={onCancel}
            isDisabled={false}
          >
            Cancel
          </ToolbarButton>
        </ToolbarContent>
      </Toolbar>
    </StackItem>
  </Stack>
);

export default WizardFooter;
