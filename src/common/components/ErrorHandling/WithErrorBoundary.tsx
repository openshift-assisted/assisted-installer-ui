import { Button, ButtonVariant } from '@patternfly/react-core';
import React, { PropsWithChildren } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { ErrorState } from '../ui';
import { useErrorMonitor } from './ErrorMonitorContext';

const getErrorFallbackComponent = ({ title }: WithErrorBoundryProps) => {
  const FallbackComponent = ({ resetErrorBoundary }: FallbackProps) => {
    const content = 'There was an internal error';
    const primaryAction = [
      <Button
        onClick={resetErrorBoundary}
        variant={ButtonVariant.link}
        isInline
        key="reset-error-boundary"
      >
        try again
      </Button>,
    ];
    return <ErrorState {...{ content, primaryAction, title }}></ErrorState>;
  };
  return FallbackComponent;
};

export type WithErrorBoundryProps = {
  title?: string;
};

export const WithErrorBoundry = ({
  children,
  ...props
}: PropsWithChildren<WithErrorBoundryProps>) => {
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
