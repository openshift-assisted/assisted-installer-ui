import React from 'react';
import { createSelector } from 'reselect';

import { ClusterTableRows } from '../types/clusters';
import { Cluster } from '../api/types';
import { ResourceUIState } from '../types';
import { Link } from 'react-router-dom';
import { IRow, IRowData } from '@patternfly/react-table';
import { RootState } from '../store/rootReducer';
import { getDateTimeCell, HumanizedSortable } from '../components/ui/table/utils';
import ClusterStatus, { getClusterStatusText } from '../components/clusters/ClusterStatus';
import { DASH } from '../components/constants';
import { routeBasePath } from '../config';
import HostsCount, { getEnabledHostsCount } from '../components/hosts/HostsCount';

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
  const { id, name, hosts, openshiftVersion, baseDnsDomain, createdAt } = cluster;
  const dateTimeCell = getDateTimeCell(createdAt);

  return {
    cells: [
      {
        title: (
          <Link key={name} to={`${routeBasePath}/clusters/${id}`} id={`cluster-link-${name}`}>
            {name}
          </Link>
        ),
        props: { 'data-testid': `cluster-name-${name}` },
        sortableValue: name,
      } as HumanizedSortable,
      {
        title: baseDnsDomain || DASH,
        props: { 'data-testid': `cluster-base-domain-${name}` },
        sortableValue: baseDnsDomain,
      },
      {
        title: openshiftVersion,
        props: { 'data-testid': `cluster-version-${name}` },
        sortableValue: openshiftVersion,
      },
      {
        title: <ClusterStatus status={cluster.status} />,
        props: { 'data-testid': `cluster-status-${name}` },
        sortableValue: getClusterStatusText(cluster.status),
      } as HumanizedSortable,
      {
        title: <HostsCount hosts={hosts} />,
        props: { 'data-testid': `cluster-hosts-count-${name}` },
        sortableValue: getEnabledHostsCount(hosts),
      } as HumanizedSortable,
      {
        title: dateTimeCell.title,
        props: { 'data-testid': `cluster-created-time-${name}` },
        sortableValue: dateTimeCell.sortableValue,
      } as HumanizedSortable,
    ],
    props: {
      name,
      id,
      baseDnsDomain,
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
