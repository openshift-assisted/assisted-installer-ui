import type { PropsWithChildren, ReactElement } from 'react';
import type { IntegrationTestsRenderOptions } from './types';
import { rest } from 'msw';
import * as React from 'react';
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

  makeHandler(options: {
    once?: boolean;
    method: 'post' | 'put' | 'get' | 'patch' | 'delete' | 'options';
    path: string;
    statusCode: number;
    body?: unknown;
  }) {
    const url = new URL(`${process.env.REACT_APP_API_ROOT}${options.path}`);
    return rest[options.method](url.href, (req, res, ctx) => {
      const resType = options.once ? res.once : res;
      if (!options.body) {
        return resType(ctx.status(options.statusCode));
      } else {
        return resType(ctx.status(options.statusCode), ctx.json(options.body));
      }
    });
  },
};

export default IntegrationTestsUtils;
