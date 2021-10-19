import type { PropsWithChildren, ReactElement } from 'react';
import type { IntegrationTestsRenderOptions } from './types';
import { rest } from 'msw';
import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../store/rootReducer';
import { AssistedInstallerUILibRootStore } from '../../store';

const makeStoreWithPreloadedState = (preloadedState = {}) =>
  configureStore({ reducer: rootReducer, preloadedState });

const makeWrapperWithStore = (store: AssistedInstallerUILibRootStore) => {
  let testHistory, testLocation;
  const WrapperComponent = ({ children }: PropsWithChildren<{}>) => (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );

  return WrapperComponent;
};

let renderWithRouter;
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

    const WrapperComponent = makeWrapperWithStore(options.store || makeStoreWithPreloadedState());
    window.history.pushState({}, 'Test page', '/');
    return render(ui, {
      wrapper: WrapperComponent,
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
