import * as React from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import mockConsole from 'jest-mock-console';
import MockServer from '../mocks/MockServer';
import { AssistedUiRouter } from '../../components';
import IntegrationTestsUtils from '../utils/IntegrationTestsUtils';
import { STANDALONE_DEPLOYMENT_ENABLED_FEATURES } from '../../../common';
import data from '../mocks/data/clustersList.json';
import { routeBasePath } from '../../config';
import userEvent from '@testing-library/user-event';

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

    const elemNewCluster = await screen.findByTestId('empty-state-new-cluster-button');
    expect(elemNewCluster).toBeInTheDocument();
    userEvent.click(elemNewCluster);
    //window.history.pushState({}, '');
    expect(window.location.pathname).toEqual(`${routeBasePath}/clusters/~new`);
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
    const elemErrState = await screen.findByTestId('error-state');
    expect(elemErrState).toBeInTheDocument();
    expect(elemErrState).toHaveTextContent('Failed to fetch clusters');
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('Clusters lists with one clusters', async () => {
    mockConsole();
    const handler = IntegrationTestsUtils.makeHandler({
      method: 'get',
      path: API_PATH,
      statusCode: 200,
      body: data,
    });
    MockServer.use(handler);
    IntegrationTestsUtils.renderWithRedux(
      <AssistedUiRouter allEnabledFeatures={STANDALONE_DEPLOYMENT_ENABLED_FEATURES} />,
    );
    //Find clusters table
    const table = await screen.findByTestId('clusters-table');
    expect(table).toBeInTheDocument();
    //Find the names of the columns
    const tableProps = ['Name', 'Base domain', 'Version', 'Hosts', 'Created at'];
    for (let i = 0; i < tableProps.length; i++) {
      const item = tableProps[i];
      const prop = await screen.findByText(item);
      expect(prop).toBeInTheDocument();
    }
    //Check if "status" appears twice in the document - as the name of a columns and as a name of a filter
    const statusProp = await screen.findAllByText(/status/i);
    expect(statusProp).toHaveLength(2);
    //Find the details of the cluster
    const tablePropsLocalhost = [
      'name',
      'base-domain',
      'version',
      'status',
      'hosts-count',
      'created-time',
    ];
    const rowData = ['localhost', 'redhat.com', '4.8.2', 'Draft', '3', '8/26/2021, 1:57:35 PM'];
    for (let i = 0; i < tablePropsLocalhost.length; i++) {
      const item = tablePropsLocalhost[i];
      const rowProp = await screen.findByTestId(`cluster-${item}-localhost`);
      expect(rowProp).toBeInTheDocument();
      expect(rowProp).toHaveTextContent(rowData[i]);
    }
    const cluster = await screen.findByText(/localhost/);
    userEvent.click(cluster);
    expect(window.location.pathname).toEqual(
      `${routeBasePath}/clusters/0f811fd0-0a08-45ad-8af0-c493561e3756`,
    );
  });

  it('Refresh button transfers to the same page', async () => {
    mockConsole();
    const handler = IntegrationTestsUtils.makeHandler({
      method: 'get',
      path: API_PATH,
      statusCode: 200,
      body: data,
    });
    MockServer.use(handler);
    IntegrationTestsUtils.renderWithRedux(
      <AssistedUiRouter allEnabledFeatures={STANDALONE_DEPLOYMENT_ENABLED_FEATURES} />,
    );
    userEvent.click(screen.getByTestId('refresh'));
    expect(window.location.pathname).toEqual(`${routeBasePath}/clusters`);
  });
});
