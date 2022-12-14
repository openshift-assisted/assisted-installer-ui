export enum ResourceUIState {
  LOADING = 'LOADING',
  RELOADING = 'RELOADING',
  EMPTY = 'EMPTY',
  LOADED = 'LOADED',
  ERROR = 'ERROR', // Polling error
  UPDATE_ERROR = 'UPDATE_ERROR',
}

export type WithTestID = {
  testId?: string;
};

export * from './versions';
export * from './proxyFields';
export * from './events';
export * from './clusters';
export * from './featureSupportLevel';
export * from './typescriptExtensions';
export * from './errortype';
