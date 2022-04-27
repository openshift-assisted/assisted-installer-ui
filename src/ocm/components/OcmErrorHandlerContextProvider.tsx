import React from 'react';
import { ErrorHandlerContextProvider } from '../../common/errorHandling/ErrorHandlerContextProvider';
import { captureMessage, captureException } from '../sentry';

export const OcmErrorHandlerContextProvider: React.FC = ({ children }) => {
  const errorTracker = React.useMemo(() => {
    return { captureException, captureMessage };
  }, []);
  return (
    <ErrorHandlerContextProvider errorTracker={errorTracker}>
      {children}
    </ErrorHandlerContextProvider>
  );
};
