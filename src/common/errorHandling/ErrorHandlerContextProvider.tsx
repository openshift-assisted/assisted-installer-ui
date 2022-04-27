import React, { PropsWithChildren } from 'react';
import { useAlerts } from '../components/AlertsContextProvider';
import find from 'lodash/find';
import Axios, { AxiosError } from 'axios';
import { APIErrorMixin } from '../../ocm/api/types';
import { generateApiErrorMessage } from './apiErrorMessage';
import {
  ErrorHandlerAPI,
  ErrorHandlerContext,
  ErrorSeverity,
  HandleErrorCommonParams,
  HandleErrorMessageParams,
  HandleErrorObjParams,
} from './ErrorHandlerContext';
import { AlertVariant } from '@patternfly/react-core';

export const isAxiosError = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: AxiosError<APIErrorMixin, APIErrorMixin> | any,
): error is AxiosError<APIErrorMixin, APIErrorMixin> => {
  return !!error.config && !!error.config.url && !!error.isAxiosError && !!error.toJSON;
};

export type ErrorTracker = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  captureException(error: any, message?: string, severity?: ErrorSeverity): void;
  captureMessage(message: string, severity?: ErrorSeverity): void;
};

export type ErrorHandlerContextProviderProps = PropsWithChildren<{
  errorTracker: ErrorTracker;
}>;

export const ErrorHandlerContextProvider: React.FC<ErrorHandlerContextProviderProps> = ({
  errorTracker,
  children,
}) => {
  const { alerts, addAlert } = useAlerts();
  const handleAlert = ({
    showAlert = true,
    message = 'Unexpected error',
    severity,
  }: HandleErrorCommonParams & { message?: string }) => {
    if (!showAlert) {
      return;
    }
    const alertPayload = {
      title: message,
      variant: severity === 'warning' ? AlertVariant.warning : AlertVariant.danger,
    };

    if (!find(alerts, { title: alertPayload.title })) {
      addAlert(alertPayload);
    }
  };

  const handleError: ErrorHandlerAPI['handleError'] = ({
    error,
    message,
    severity = 'error',
    ...params
  }) => {
    errorTracker.captureException(error, message, severity);
    handleAlert({ message, severity, ...params });
  };

  const handleErrorMessage: ErrorHandlerAPI['handleErrorMessage'] = (
    params: HandleErrorMessageParams,
  ) => {
    errorTracker.captureMessage(params.message, params.severity);
    handleAlert(params);
  };

  const handleApiError: ErrorHandlerAPI['handleApiError'] = (params: HandleErrorObjParams) => {
    if (!isAxiosError(params.error)) {
      handleError(params);
      return;
    } else if (Axios.isCancel(params.error)) {
      handleErrorMessage({
        message: 'Request canceled',
        severity: 'info',
        showAlert: params.showAlert,
      });
    } else {
      errorTracker.captureMessage(generateApiErrorMessage(params.error));
      const message = params.error.response?.data.reason || params.message;
      handleAlert({ ...params, message });
    }
  };

  const errorHandlerAPI = React.useMemo<ErrorHandlerAPI>(() => {
    return { handleError, handleErrorMessage, handleApiError };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ErrorHandlerContext.Provider value={errorHandlerAPI}>{children}</ErrorHandlerContext.Provider>
  );
};
