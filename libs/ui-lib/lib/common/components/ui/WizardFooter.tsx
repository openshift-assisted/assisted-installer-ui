import * as React from 'react';
import {
  ActionList,
  ActionListItem,
  Button,
  ButtonVariant,
  Spinner,
  SplitItem,
  Stack,
  StackItem,
  Content,
  ContentVariants,
} from '@patternfly/react-core';
import { useTranslation } from '../../hooks/use-translation-wrapper';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { EventListFetchProps } from '../../types/events';
import ViewClusterEventsButton from './ViewClusterEventsButton';

export type WizardFooterGenericProps = {
  onNext?: () => void;
  onBack?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
  isSubmitting?: boolean;
  submittingText?: string;
  nextButtonText?: string;
  isNextButtonLoading?: boolean;
};

type WizardFooterProps = WizardFooterGenericProps & {
  alerts?: React.ReactNode;
  errors?: React.ReactNode;
  leftExtraActions?: React.ReactNode;
  cluster?: Cluster;
  onFetchEvents?: EventListFetchProps['onFetchEvents'];
};

export const WizardFooter: React.FC<WizardFooterProps> = ({
  alerts,
  errors,
  onNext,
  onBack,
  onCancel,
  onReset,
  isNextDisabled,
  isBackDisabled,
  leftExtraActions,
  isSubmitting,
  submittingText,
  nextButtonText,
  cluster,
  onFetchEvents,
  isNextButtonLoading,
}) => {
  const { t } = useTranslation();
  submittingText = submittingText || t('ai:Saving changes...');
  return (
    <Stack hasGutter>
      {alerts && <StackItem>{alerts}</StackItem>}
      {errors && <StackItem>{errors}</StackItem>}
      <StackItem>
        <ActionList data-testid="wizard-step-actions">
          {leftExtraActions}
          {onNext && (
            <ActionListItem>
              <Button
                variant={ButtonVariant.primary}
                name="next"
                onClick={onNext}
                isDisabled={isNextDisabled}
                isLoading={isNextButtonLoading}
              >
                {nextButtonText || t('ai:Next')}
              </Button>
            </ActionListItem>
          )}
          {onBack && (
            <ActionListItem>
              <Button
                variant={ButtonVariant.secondary}
                name="back"
                onClick={onBack}
                isDisabled={isBackDisabled}
              >
                {t('ai:Back')}
              </Button>
            </ActionListItem>
          )}
          {onCancel && (
            <ActionListItem>
              <Button
                variant={ButtonVariant.link}
                name="cancel"
                onClick={onCancel}
                isDisabled={false}
              >
                {t('ai:Cancel')}
              </Button>
            </ActionListItem>
          )}
          {onReset && cluster && (
            <ActionListItem>
              <Button
                variant={ButtonVariant.link}
                name="reset"
                onClick={onReset}
                isDisabled={isSubmitting}
              >
                {t('ai:Reset')}
              </Button>
            </ActionListItem>
          )}
          {isSubmitting && (
            <ActionListItem>
              <Content component={ContentVariants.small}>
                <Spinner size="sm" /> {submittingText}
              </Content>
            </ActionListItem>
          )}
          <SplitItem isFilled />
          {cluster && onFetchEvents && (
            <ActionListItem>
              <ViewClusterEventsButton cluster={cluster} onFetchEvents={onFetchEvents} />
            </ActionListItem>
          )}
        </ActionList>
      </StackItem>
    </Stack>
  );
};
