import React from 'react';
import { createSelector } from '@reduxjs/toolkit';
import type { IRow, IRowData } from '@patternfly/react-table';
import { Link } from 'react-router-dom-v5-compat';
import type { TFunction } from 'i18next';
import {
  DASH,
  getDateTimeCell,
  getEnabledHostCount,
  getOpenshiftVersionText,
  getTotalHostCount,
  HostsCount,
  ResourceUIState,
} from '../../../../common';
import type { ClusterTableRows, HumanizedSortable } from '../../../../common';
import ClusterStatus, { getClusterStatusText } from '../../../components/clusters/ClusterStatus';
import { RootStateDay1 } from '../../store-day1';
import type { Cluster } from '@openshift-assisted/types/assisted-installer-service';

const selectClusters = (state: RootStateDay1) => state.clusters.data;
const clustersUIState = (state: RootStateDay1) => state.clusters.uiState;

export const selectClustersUIState = createSelector(
  [selectClusters, clustersUIState],
  (clusters, uiState): ResourceUIState => {
    const { LOADED, EMPTY } = ResourceUIState;
    return !clusters.length && uiState === LOADED ? EMPTY : uiState;
  },
);

export type ClusterRowDataProps = {
  id: string;
  name: string;
  baseDnsDomain?: string;
};

const clusterToClusterTableRow = (cluster: Cluster, t: TFunction): IRow => {
  const { id, name = '', baseDnsDomain, createdAt } = cluster;
  const dateTimeCell = getDateTimeCell(createdAt);
  const versionText = getOpenshiftVersionText({
    openshiftVersion: cluster.openshiftVersion || '',
    cpuArchitecture: cluster.cpuArchitecture,
    withMultiText: true,
  });
  const props: ClusterRowDataProps = {
    name,
    id,
    baseDnsDomain,
  };

  return {
    cells: [
      {
        title: (
          <Link key={name} to={id} id={`cluster-link-${id}`}>
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
        title: versionText,
        props: { 'data-testid': `cluster-version-${name}` },
        sortableValue: versionText,
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
    props,
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
