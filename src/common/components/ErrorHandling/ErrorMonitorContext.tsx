import React, { PropsWithChildren } from 'react';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export type ExceptionReporter = (
  error: unknown,
  message?: string,
  severity?: ErrorSeverity,
) => void;

export const ErrorMonitorContext = React.createContext<{
  captureException: ExceptionReporter;
}>({
  captureException: () => {
    return;
  },
});

export const ErrorMonitorContextProvider = ({
  exceptionReporter,
  children,
}: PropsWithChildren<{ exceptionReporter: ExceptionReporter }>) => {
  return (
    <ErrorMonitorContext.Provider value={{ captureException: exceptionReporter }}>
      {children}
    </ErrorMonitorContext.Provider>
  );
};

export const useErrorMonitor = () => {
  return React.useContext(ErrorMonitorContext);
};
