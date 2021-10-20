import * as React from 'react';
import { screen, within } from '@testing-library/react';
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
  describe('when there is no network failure', () => {
    it('the refresh button refreshes the clusters list', async () => {
      mockConsole();
      const emptyHandler = IntegrationTestsUtils.makeServerHandler({
        method: 'get',
        path: API_PATH,
        statusCode: 200,
        body: [data[0]],
        once: true,
      });
      MockServer.use(emptyHandler);
      IntegrationTestsUtils.render(
        <AssistedUiRouter allEnabledFeatures={STANDALONE_DEPLOYMENT_ENABLED_FEATURES} />,
      );
      const clustersTableElement = await screen.findByTestId('clusters-table');
      expect(clustersTableElement).toBeInTheDocument();

      const handlerWithClusters = IntegrationTestsUtils.makeServerHandler({
        method: 'get',
        path: API_PATH,
        statusCode: 200,
        body: data,
        once: true,
      });
      MockServer.use(handlerWithClusters);

      userEvent.click(await screen.findByTestId('clusters-list-refresh-button'));

      expect(within(clustersTableElement).getByText(/localhost/i)).toBeInTheDocument();
    });

    describe('when there are no clusters yet', () => {
      beforeEach(() => {
        mockConsole();
        const handler = IntegrationTestsUtils.makeServerHandler({
          method: 'get',
          path: API_PATH,
          statusCode: 200,
          body: [],
        });
        MockServer.use(handler);
        IntegrationTestsUtils.render(
          <AssistedUiRouter allEnabledFeatures={STANDALONE_DEPLOYMENT_ENABLED_FEATURES} />,
        );
      });

      it('renders the EmptyState', async () => {
        const emptyStateElement = await screen.findByTestId('empty-state');
        expect(emptyStateElement).toBeInTheDocument();
      });

      it("the EmptyState's 'Create new cluster' button switches to the create cluster page", async () => {
        const createNewClusterButton = await screen.findByTestId('empty-state-new-cluster-button');
        expect(createNewClusterButton).toBeInTheDocument();

        userEvent.click(createNewClusterButton);
        expect(window.location.pathname).toEqual(`${routeBasePath}/clusters/~new`);
      });
    });

    describe('there are clusters', () => {
      // TODO(jkilzi): the test below needs polishing
      xit('displays the clusters', async () => {
        mockConsole();
        const handler = IntegrationTestsUtils.makeServerHandler({
          method: 'get',
          path: API_PATH,
          statusCode: 200,
          body: [data[0]],
        });
        MockServer.use(handler);
        IntegrationTestsUtils.render(
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
        const rowData = [
          'localhost',
          'redhat.com',
          '4.8.2',
          'Draft',
          '3',
          // Date is not guaranteed to be rendered as is, depends on the user's locale settings.
          // In my case, this date is displayed as: 26/8/2021, 13:57:35
          '8/26/2021, 1:57:35 PM',
        ];
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
    });
  });
  describe('when there is a network failure', () => {
    it('renders the ErrorState component', async () => {
      mockConsole();
      const handler = IntegrationTestsUtils.makeServerHandler({
        method: 'get',
        path: API_PATH,
        statusCode: 500,
      });
      MockServer.use(handler);
      IntegrationTestsUtils.render(
        <AssistedUiRouter allEnabledFeatures={STANDALONE_DEPLOYMENT_ENABLED_FEATURES} />,
      );
      const elemErrState = await screen.findByTestId('error-state');
      expect(elemErrState).toBeInTheDocument();
      expect(elemErrState).toHaveTextContent('Failed to fetch clusters');
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });
});
