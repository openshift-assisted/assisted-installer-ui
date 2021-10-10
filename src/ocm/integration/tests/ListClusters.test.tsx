import React from 'react';
import { screen } from '@testing-library/react';
import MockServer from '../mocks/MockServer';
import { AssistedUiRouter } from '../../components';
import IntegrationTestsUtils from '../utils/IntegrationTestsUtils';
import { STANDALONE_DEPLOYMENT_ENABLED_FEATURES } from '../../../common';

describe('List clusters', () => {
  const API_PATH = 'http://localhost:3000/api/assisted-install/v1/clusters';

  it('When there is no network failure and no clusters, renders the EmptyState component', async () => {
    const handler = IntegrationTestsUtils.makeHandler('get', API_PATH, 200, []);
    MockServer.use(handler);
    IntegrationTestsUtils.renderWithRedux(
      <AssistedUiRouter allEnabledFeatures={STANDALONE_DEPLOYMENT_ENABLED_FEATURES} />,
    );

    const element = await screen.findByTestId('error-state');
    expect(element).toBeInTheDocument();
  });
  it('When there is a network failure, renders the ErrorState component', async () => {
    const handler = IntegrationTestsUtils.makeHandler('get', API_PATH, 500);
    MockServer.use(handler);
    IntegrationTestsUtils.renderWithRedux(
      <AssistedUiRouter allEnabledFeatures={STANDALONE_DEPLOYMENT_ENABLED_FEATURES} />,
    );

    const element = await screen.findByTestId('error-state');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Failed to fetch clusters');
  });
});
