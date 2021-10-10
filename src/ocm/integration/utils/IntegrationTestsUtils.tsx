import type { PropsWithChildren, ReactElement } from 'react';
import type { IntegrationTestsRenderOptions } from './types';
import { rest } from 'msw';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../store/rootReducer';
import { AssistedInstallerUILibRootStore } from '../../store';

const makeStoreWithPreloadedState = (preloadedState = {}) =>
  configureStore({ reducer: rootReducer, preloadedState });

const makeWrapperWithStore = (store: AssistedInstallerUILibRootStore) => {
  const WrapperComponent = ({ children }: PropsWithChildren<{}>) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  );

  return WrapperComponent;
};

const IntegrationTestsUtils = {
  renderWithRedux(
    ui: ReactElement,
    options: IntegrationTestsRenderOptions = {
      store: makeStoreWithPreloadedState(),
    },
  ) {
    if (options.preloadedState) {
      options.store = makeStoreWithPreloadedState(options.preloadedState);
    }

    return render(ui, {
      wrapper: makeWrapperWithStore(options.store || makeStoreWithPreloadedState()),
      ...options,
    });
  },

  makeHandler(
    method: 'post' | 'get' | 'patch' | 'delete',
    path: string,
    statusCode: number,
    body?: unknown,
  ) {
    return rest[method](path, (req, res, ctx) => {
      if (!body) {
        return res(ctx.status(statusCode));
      } else {
        return res(ctx.status(statusCode), ctx.json(body));
      }
    });
  },
};

export default IntegrationTestsUtils;
