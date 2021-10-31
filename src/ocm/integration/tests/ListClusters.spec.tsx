import * as React from 'react';
import { screen, within } from '@testing-library/react';
import mockConsole from 'jest-mock-console';
import MockServer from '../mocks/MockServer';
import { AssistedUiRouter } from '../../components';
import IntegrationTestsUtils, { HTTPmethod } from '../utils/IntegrationTestsUtils';
import { Cluster, STANDALONE_DEPLOYMENT_ENABLED_FEATURES } from '../../../common';
import { routeBasePath } from '../../config';
import userEvent from '@testing-library/user-event';
import MockClusterGenerator from '../mocks/generators/MockClusterGenerator';

const API_PATH = `/v1/clusters`;

const setServer = (body: Cluster[], method: HTTPmethod, statusCode: number, path = API_PATH) => {
  mockConsole();
  const handler = IntegrationTestsUtils.makeServerHandler({
    method,
    path,
    statusCode,
    body,
  });
  MockServer.use(handler);
};

describe('List clusters', () => {
  describe('when there is no network failure', () => {
    it('the refresh button refreshes the clusters list', async () => {
      mockConsole();
      const cluster1 = MockClusterGenerator.generate({ name: 'localhost1' });
      setServer([cluster1], 'get', 200);
      IntegrationTestsUtils.render(
        <AssistedUiRouter allEnabledFeatures={STANDALONE_DEPLOYMENT_ENABLED_FEATURES} />,
      );
      const clustersTableElement = await screen.findByTestId('clusters-table');
      expect(clustersTableElement).toBeInTheDocument();

      expect(screen.getByTestId(`cluster-name-${cluster1.name}`)).toBeInTheDocument();

      const cluster2 = MockClusterGenerator.generate({ name: 'localhost2' });
      setServer([cluster1, cluster2], 'get', 200);

      userEvent.click(await screen.findByTestId('clusters-list-refresh-button'));
      expect(await screen.findByTestId(`cluster-name-${cluster1.name}`)).toBeInTheDocument();
      expect(await screen.findByTestId(`cluster-name-${cluster2.name}`)).toBeInTheDocument();
    });

    describe('when there are no clusters yet', () => {
      beforeEach(() => {
        setServer([], 'get', 200);
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
      it('can delete a cluster', async () => {
        const cluster = MockClusterGenerator.generate({ name: 'localhost' });
        setServer([cluster], 'get', 200);
        IntegrationTestsUtils.render(
          <AssistedUiRouter allEnabledFeatures={STANDALONE_DEPLOYMENT_ENABLED_FEATURES} />,
        );
        expect(window.location.pathname).toEqual(`${routeBasePath}/clusters`);

        const clusterRow = await screen.findByTestId(`cluster-row-${cluster.name}`);
        expect(clusterRow).toBeInTheDocument();

        const kebabMenu = await within(clusterRow).findByRole('button', { expanded: false });
        expect(kebabMenu).toBeInTheDocument();

        userEvent.click(kebabMenu);
        const deleteButton = await within(clusterRow).findByRole('menuitem');
        expect(deleteButton).toBeInTheDocument();

        userEvent.click(deleteButton);
        const deleteSubmit = await screen.findByTestId('delete-cluster-submit');
        expect(deleteSubmit).toBeInTheDocument();

        setServer([], 'delete', 200, `${API_PATH}/${cluster.id}`);

        userEvent.click(deleteSubmit);
        const emptyStateElement = await screen.findByTestId('empty-state');
        expect(emptyStateElement).toBeInTheDocument();
      });

      it('displays the cluster', async () => {
        const clusterProps = {
          name: 'localhost',
          totalHostCount: 3,
          baseDnsDomain: 'redhat.com',
          openshiftVersion: '3.8.2',
          createdAt: '1',
        };

        const cluster = MockClusterGenerator.generate(clusterProps);
        setServer([cluster], 'get', 200);
        IntegrationTestsUtils.render(
          <AssistedUiRouter allEnabledFeatures={STANDALONE_DEPLOYMENT_ENABLED_FEATURES} />,
        );

        const table = await screen.findByTestId('clusters-table');
        expect(table).toBeInTheDocument();

        //Check if "status" appears twice in the document - as the name of a columns and as a name of a filter
        const statusProp = await screen.findAllByText(/status/i);
        expect(statusProp).toHaveLength(2);

        //Find the names of the columns
        const tableProps = ['Name', 'Base domain', 'Version', 'Hosts', 'Created at'];
        for (let i = 0; i < tableProps.length; i++) {
          const item = tableProps[i];
          const prop = await screen.findByText(item);
          expect(prop).toBeInTheDocument();
        }

        //Find the details of the cluster
        const tablePropsTestId = [
          'name',
          'base-domain',
          'version',
          'status',
          'hosts-count',
          'created-time',
        ];

        const rowData = [
          cluster.name,
          cluster.baseDnsDomain,
          cluster.openshiftVersion,
          'Draft',
          cluster.totalHostCount,
          cluster.createdAt,
        ];

        for (let i = 0; i < tablePropsTestId.length; i++) {
          const item = tablePropsTestId[i];
          const rowProp = await screen.findByTestId(`cluster-${item}-${cluster.name}`);
          expect(rowProp).toBeInTheDocument();
          expect(rowProp).toHaveTextContent(`${rowData[i]}`);
        }

        const clusterLink = within(table).getByText(`${cluster.name}`);
        userEvent.click(clusterLink);
        expect(window.location.pathname).toEqual(`${routeBasePath}/clusters/${cluster.id}`);
      });
    });
  });

  describe('when there is a network failure', () => {
    it('renders the ErrorState component', async () => {
      setServer([], 'get', 500);
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
