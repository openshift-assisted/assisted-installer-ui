import React from 'react';
import { createSelector } from 'reselect';
import { IRow, IRowData } from '@patternfly/react-table';
import { Link } from 'react-router-dom';

import { ClusterTableRows } from '../../common/types/clusters';
import {
  Cluster,
  DASH,
  getDateTimeCell,
  getEnabledHostCount,
  getTotalHostCount,
  HostsCount,
  HumanizedSortable,
  ResourceUIState,
} from '../../common';
import ClusterStatus, { getClusterStatusText } from '../components/clusters/ClusterStatus';
import { routeBasePath } from '../config/routeBaseBath';
import { TFunction } from 'i18next';
import { RootState } from '../store';

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

const clusterToClusterTableRow = (cluster: Cluster, t: TFunction): IRow => {
  const { id, name = '', openshiftVersion, baseDnsDomain, createdAt } = cluster;
  const dateTimeCell = getDateTimeCell(createdAt);
  return {
    cells: [
      {
        title: (
          <Link key={name} to={`${routeBasePath}/clusters/${id}`} id={`cluster-link-${id}`}>
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
        sortableValue: getClusterStatusText(t, cluster.status),
      } as HumanizedSortable,
      {
        title: <HostsCount cluster={cluster} />,
        props: { 'data-testid': `cluster-hosts-count-${name}` },
        sortableValue:
          'enabledHostCount' in cluster ? getEnabledHostCount(cluster) : getTotalHostCount(cluster),
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

export const selectClusterTableRows = (t: TFunction) => {
  return createSelector(
    selectClusters,
    (clusters): ClusterTableRows => clusters.map((c) => clusterToClusterTableRow(c, t)),
  );
};

export const selectClusterNames = createSelector(selectClusters, (clusters) =>
  clusters.map((c) => c.name),
);

export const selectClusterNamesButCurrent = createSelector(
  selectClusterNames,
  currentClusterName,
  (clusterNames, currentName) => clusterNames.filter((n) => n !== currentName),
);
