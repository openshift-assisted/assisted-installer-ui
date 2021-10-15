import { RenderOptions } from '@testing-library/react';
import { ConfigureStoreOptions } from '@reduxjs/toolkit';
import { AssistedInstallerUILibRootStore } from '../../store';

export type IntegrationTestsRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  preloadedState?: ConfigureStoreOptions['preloadedState'];
  store?: AssistedInstallerUILibRootStore;
};
