import React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  Bullseye,
  EmptyStateVariant,
  Button,
  ButtonVariant,
  EmptyStateActions,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { useTranslation } from '../../../hooks/use-translation-wrapper';

type ErrorStateProps = {
  title?: string;
  content?: React.ReactNode;
  fetchData?: () => void;
  icon?: React.ComponentClass;
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
  variant = EmptyStateVariant.sm,
  primaryAction,
  actions,
}: ErrorStateProps) => {
  return (
    <Bullseye>
      <EmptyState
        status="danger"
        headingLevel="h2"
        icon={icon}
        titleText={<>{title}</>}
        variant={variant}
      >
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
