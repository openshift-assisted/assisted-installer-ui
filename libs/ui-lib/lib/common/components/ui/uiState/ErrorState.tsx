import React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  Bullseye,
  EmptyStateIcon,
  EmptyStateVariant,
  Button,
  ButtonVariant,
  EmptyStateIconProps,
  EmptyStateActions,
  EmptyStateHeader,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { global_danger_color_200 as globalDangerColor200 } from '@patternfly/react-tokens/dist/js/global_danger_color_200';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

type ErrorStateProps = {
  title?: string;
  content?: React.ReactNode;
  fetchData?: () => void;
  icon?: EmptyStateIconProps['icon'];
  iconColor?: string;
  primaryAction?: React.ReactNode;
  actions?: React.ReactNode[];
  variant?: EmptyStateVariant;
};

const DefaultErrorContent = ({ fetchData }: { fetchData: ErrorStateProps['fetchData'] }) => {
  const { t } = useTranslation();
  return (
    <>
      {t('ai:There was an error retrieving data. Check your connection and')}{' '}
      {fetchData ? (
        <Button onClick={fetchData} variant={ButtonVariant.link} isInline>
          {t('ai:try again')}
        </Button>
      ) : (
        t('ai:try again')
      )}
      .
    </>
  );
};

const ErrorState = ({
  title = 'Error loading data',
  content,
  fetchData,
  icon = ExclamationCircleIcon,
  iconColor = globalDangerColor200.value,
  variant = EmptyStateVariant.sm,
  primaryAction,
  actions,
}: ErrorStateProps) => {
  return (
    <Bullseye>
      <EmptyState variant={variant}>
        <EmptyStateHeader
          titleText={<>{title}</>}
          icon={<EmptyStateIcon icon={icon} color={iconColor} />}
          headingLevel="h2"
        />
        <EmptyStateBody>{content || <DefaultErrorContent fetchData={fetchData} />}</EmptyStateBody>
        <EmptyStateFooter>
          {primaryAction}
          {actions && <EmptyStateActions>{actions}</EmptyStateActions>}
        </EmptyStateFooter>
      </EmptyState>
    </Bullseye>
  );
};

export default ErrorState;
