import React from 'react';
import { AxiosError } from 'axios';
import { APIErrorMixin } from '../../ocm/api/types';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export type HandleErrorCommonParams = {
  severity?: ErrorSeverity;
  showAlert?: boolean;
};

export type HandleErrorObjParams = HandleErrorCommonParams & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any;
  message?: string;
};

export type HandleApiErrorParams = HandleErrorCommonParams & {
  error: AxiosError<APIErrorMixin, APIErrorMixin> | unknown;
  message?: string;
};

export type HandleErrorMessageParams = HandleErrorCommonParams & {
  message: string;
};

export type ErrorHandlerAPI = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError(params: HandleErrorObjParams): void;
  handleErrorMessage(params: HandleErrorMessageParams): void;
  handleApiError(params: HandleApiErrorParams): void;
};

export const ErrorHandlerContext = React.createContext<ErrorHandlerAPI | null>(null);

export const useErrorHandler = () => {
  const context = React.useContext(ErrorHandlerContext);
  if (!context) {
    throw new Error(
      'useFeatureSupportLevel must be used within FeatureSupportLevelContextProvider.',
    );
  }
  return context;
};
