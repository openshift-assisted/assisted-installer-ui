import React from 'react';
import { createSelector } from 'reselect';

import { ClusterTableRows } from '../types/clusters';
import { Cluster } from '../api/types';
import { ResourceUIState } from '../types';
import { Link } from 'react-router-dom';
import { IRow, IRowData } from '@patternfly/react-table';
import { RootState } from '../store/rootReducer';
import { HumanizedSortable } from '../components/ui/table/utils';
import ClusterStatus, { getClusterStatusText } from '../components/clusters/ClusterStatus';
import { DASH } from '../components/constants';

const selectClusters = (state: RootState) => state.clusters.data;
const clustersUIState = (state: RootState) => state.clusters.uiState;
const currentClusterName = (state: RootState) => state.currentCluster.data?.name;

export const selectClustersUIState = createSelector(
  [selectClusters, clustersUIState],
  (clusters, uiState): ResourceUIState => {
    const { LOADED, EMPTY } = ResourceUIState;
    return !clusters.length && uiState === LOADED ? EMPTY : uiState;
  },
);

const clusterToClusterTableRow = (cluster: Cluster): IRow => {
  const { id, name, hosts, openshiftVersion, baseDnsDomain } = cluster;
  const hostsCount = hosts ? hosts.length : 0;

  return {
    cells: [
      {
        title: (
          <Link key={name} to={`/clusters/${id}`}>
            {name}
          </Link>
        ),
        sortableValue: name,
      } as HumanizedSortable,
      baseDnsDomain || DASH,
      openshiftVersion,
      {
        title: <ClusterStatus cluster={cluster} />,
        sortableValue: getClusterStatusText(cluster),
      } as HumanizedSortable,
      {
        title: hostsCount.toString(),
        sortableValue: hostsCount,
      } as HumanizedSortable,
    ],
    props: {
      name,
      id,
    },
  };
};

export const getClusterTableStatusCell = (rowData: IRowData) =>
  rowData?.cells?.[3] as HumanizedSortable;

export const selectClusterTableRows = createSelector(
  selectClusters,
  (clusters): ClusterTableRows => clusters.map(clusterToClusterTableRow),
);

export const selectClusterNames = createSelector(selectClusters, (clusters) =>
  clusters.map((c) => c.name),
);

export const selectClusterNamesButCurrent = createSelector(
  selectClusterNames,
  currentClusterName,
  (clusterNames, currentName) => clusterNames.filter((n) => n !== currentName),
);
