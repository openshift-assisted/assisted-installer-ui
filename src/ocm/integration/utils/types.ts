import { RenderOptions } from '@testing-library/react';
import { ConfigureStoreOptions } from '@reduxjs/toolkit';
import { AssistedInstallerUILibRootStore } from '../../store';

export type IntegrationTestsRenderOptions<C = never> = Omit<RenderOptions, 'wrapper'> & {
  preloadedState?: ConfigureStoreOptions['preloadedState'];
  store?: AssistedInstallerUILibRootStore;
  route?: string;
  routeContext?: C;
};
