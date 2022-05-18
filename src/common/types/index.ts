export enum ResourceUIState {
  LOADING = 'LOADING',
  RELOADING = 'RELOADING',
  ERROR = 'ERROR',
  EMPTY = 'EMPTY',
  LOADED = 'LOADED',
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
