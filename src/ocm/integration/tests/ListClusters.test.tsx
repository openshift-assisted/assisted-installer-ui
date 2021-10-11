import * as React from 'react';
import { screen } from '@testing-library/react';
import mockConsole from 'jest-mock-console';
import MockServer from '../mocks/MockServer';
import { AssistedUiRouter } from '../../components';
import IntegrationTestsUtils from '../utils/IntegrationTestsUtils';
import { STANDALONE_DEPLOYMENT_ENABLED_FEATURES } from '../../../common';

const API_PATH = `/v1/clusters`;

describe('List clusters', () => {
  it('When there is no network failure and no clusters, renders the EmptyState component', async () => {
    mockConsole();
    const handler = IntegrationTestsUtils.makeHandler({
      method: 'get',
      path: API_PATH,
      statusCode: 200,
      body: [],
    });
    MockServer.use(handler);
    IntegrationTestsUtils.renderWithRedux(
      <AssistedUiRouter allEnabledFeatures={STANDALONE_DEPLOYMENT_ENABLED_FEATURES} />,
    );

    const element = await screen.findByTestId('empty-state');
    expect(element).toBeInTheDocument();
  });

  it('When there is a network failure, renders the ErrorState component', async () => {
    mockConsole();
    const handler = IntegrationTestsUtils.makeHandler({
      method: 'get',
      path: API_PATH,
      statusCode: 500,
    });
    MockServer.use(handler);
    IntegrationTestsUtils.renderWithRedux(
      <AssistedUiRouter allEnabledFeatures={STANDALONE_DEPLOYMENT_ENABLED_FEATURES} />,
    );

    const element = await screen.findByTestId('error-state');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Failed to fetch clusters');
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});
