import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  ButtonVariant,
  Spinner,
  Stack,
  StackItem,
  Text,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import Alerts from '../ui/Alerts';
import { useAlerts } from '../AlertsContextProvider';
import { routeBasePath } from '../../config/constants';
import ToolbarButton from '../ui/Toolbar/ToolbarButton';
import { Cluster } from '../../api/types';
import ClusterValidationSection from '../clusterConfiguration/ClusterValidationSection';

interface ClusterWizardFooterProps {
  cluster?: Cluster;
  errorFields?: string[];
  isSubmitting?: boolean;
  submittingText?: string;
  onNext?: () => void;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  onBack?: () => void;
  onCancel?: () => void;
  additionalActions?: React.ReactNode;
}

const ClusterWizardFooter = ({
  cluster,
  errorFields,
  onNext,
  onBack,
  isNextDisabled,
  isBackDisabled,
  onCancel,
  isSubmitting,
  submittingText = 'Saving changes...',
  additionalActions,
}: ClusterWizardFooterProps) => {
  const { alerts } = useAlerts();
  const history = useHistory();

  const handleCancel = React.useCallback(() => history.push(`${routeBasePath}/clusters/`), [
    history,
  ]);

  return (
    <Stack hasGutter>
      {!!alerts.length && (
        <StackItem>
          <Alerts />
        </StackItem>
      )}
      <StackItem>
        <ClusterValidationSection cluster={cluster} errorFields={errorFields} />
      </StackItem>
      <StackItem>
        <Toolbar data-testid="wizard-step-actions">
          <ToolbarContent>
            {additionalActions}
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
              onClick={onCancel || handleCancel}
              isDisabled={false}
            >
              Cancel
            </ToolbarButton>
            {isSubmitting && (
              <ToolbarItem>
                <Text component={TextVariants.small}>
                  <Spinner size="sm" /> {submittingText}
                </Text>
              </ToolbarItem>
            )}
          </ToolbarContent>
        </Toolbar>
      </StackItem>
    </Stack>
  );
};

export default ClusterWizardFooter;
