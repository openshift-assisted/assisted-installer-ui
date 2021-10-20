import type { PropsWithChildren, ReactElement } from 'react';
import type { IntegrationTestsRenderOptions } from './types';
import { rest } from 'msw';
import * as React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../store/rootReducer';

const WINDOW_TITLE = 'OpenShift Assisted Installer';

const makeStoreWithPreloadedState = (preloadedState = {}) =>
  configureStore({ reducer: rootReducer, preloadedState });

const makeWithStoreWrapper = (store = makeStoreWithPreloadedState()) => {
  const WithStoreWrapper = ({ children }: PropsWithChildren<{}>) => (
    <Provider store={store}>{children}</Provider>
  );

  return WithStoreWrapper;
};

const makeWithBrowserRouterWrapper = (context = {}, route = '/') => {
  window.history.pushState(context, WINDOW_TITLE, route);
  const WithBrowserRouterWrapper = ({ children }: PropsWithChildren<{}>) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  return WithBrowserRouterWrapper;
};

const makeAppContainer = (element = 'div') => {
  const container = document.createElement(element);
  container.setAttribute('role', 'main');

  return container;
};

const IntegrationTestsUtils = {
  render(
    ui: ReactElement,
    options: IntegrationTestsRenderOptions = {
      store: makeStoreWithPreloadedState(),
    },
  ) {
    if (options.preloadedState) {
      options.store = makeStoreWithPreloadedState(options.preloadedState);
    }

    const WithStoreWrapper = makeWithStoreWrapper(options.store);
    const WithBrowserRouterWrapper = makeWithBrowserRouterWrapper(
      options.routeContext,
      options.route,
    );
    const Wrapper = ({ children }: PropsWithChildren<{}>) => (
      <WithStoreWrapper>
        <WithBrowserRouterWrapper>{children}</WithBrowserRouterWrapper>
      </WithStoreWrapper>
    );

    const main = document.createElement('main');
    main.setAttribute('role', 'main');
    return render(ui, {
      container: document.body.appendChild(makeAppContainer()),
      wrapper: Wrapper,
      ...options,
    });
  },

  makeServerHandler(options: {
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
