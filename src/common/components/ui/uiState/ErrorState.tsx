import React from 'react';
import {
  Title,
  EmptyState,
  EmptyStateBody,
  Bullseye,
  EmptyStateIcon,
  EmptyStateVariant,
  Button,
  ButtonVariant,
  EmptyStateSecondaryActions,
  EmptyStateIconProps,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { global_danger_color_200 as globalDangerColor200 } from '@patternfly/react-tokens';
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
  variant = EmptyStateVariant.small,
  primaryAction,
  actions,
}: ErrorStateProps) => {
  return (
    <Bullseye>
      <EmptyState variant={variant}>
        <EmptyStateIcon icon={icon} color={iconColor} />
        <Title headingLevel="h2">{title}</Title>
        <EmptyStateBody>{content || <DefaultErrorContent fetchData={fetchData} />}</EmptyStateBody>
        {primaryAction}
        {actions && <EmptyStateSecondaryActions>{actions}</EmptyStateSecondaryActions>}
      </EmptyState>
    </Bullseye>
  );
};

export default ErrorState;
