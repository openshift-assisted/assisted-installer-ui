export enum ResourceUIState {
  LOADING = 'LOADING',
  RELOADING = 'RELOADING',
  EMPTY = 'EMPTY',
  LOADED = 'LOADED',
  POLLING_ERROR = 'POLLING_ERROR',
  UPDATE_ERROR = 'UPDATE_ERROR',
}

export type WithTestID = {
  testId?: string;
};

export * from './versions';
export * from './events';
export * from './clusters';
export * from './featureSupportLevel';
export * from './typescriptExtensions';
export * from './generateIsoFields';
export * from './errortype';
