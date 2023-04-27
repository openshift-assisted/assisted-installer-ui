import { Button, ButtonVariant } from '@patternfly/react-core';
import React, { PropsWithChildren } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ErrorState } from '../ui';
import { useErrorMonitor } from './ErrorMonitorContext';

const getErrorFallbackComponent = ({
  title,
  content = 'There was an internal error',
  showReloadAction = true,
}: WithErrorBoundaryProps) => {
  const FallbackComponent = ({ resetErrorBoundary }: FallbackProps) => {
    const primaryAction = showReloadAction ? (
      <Button
        onClick={resetErrorBoundary}
        variant={ButtonVariant.link}
        isInline
        key="reset-error-boundary"
      >
        try again
      </Button>
    ) : null;
    return <ErrorState {...{ content, primaryAction, title }} />;
  };
  return FallbackComponent;
};

export type WithErrorBoundaryProps = {
  title?: string;
  content?: string;
  showReloadAction?: boolean;
};

export const WithErrorBoundary = ({
  children,
  ...props
}: PropsWithChildren<WithErrorBoundaryProps>) => {
  const { captureException } = useErrorMonitor();
  const errorHandler = (error: Error) => {
    captureException(error, props.title);
  };
  return (
    <ErrorBoundary FallbackComponent={getErrorFallbackComponent(props)} onError={errorHandler}>
      {children}
    </ErrorBoundary>
  );
};
