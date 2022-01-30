/* eslint-disable @typescript-eslint/no-explicit-any */
export type ErrorSeverity = 'error' | 'warning' | 'info';
export type ErrorHandler = (error: any, message?: string, severity?: ErrorSeverity) => void;
