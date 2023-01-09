import { Title } from '@patternfly/react-core';
import { Table, TableVariant, TableBody } from '@patternfly/react-table';
import React from 'react';
import { Cluster, isDualStack } from '../../../../common';
import {
  getManagementType,
  getStackTypeLabel,
  getNetworkType,
} from '../../clusterDetail/ClusterProperties';

export const ReviewNetworkingTable = ({ cluster }: { cluster: Cluster }) => {
  const rows = React.useMemo(() => {
    return [
      {
        cells: [
          { title: 'Networking management type' },
          {
            title: getManagementType(cluster),
            props: { 'data-testid': 'networking-management-type', colSpan: 2 },
          },
        ],
      },
      {
        cells: [
          { title: 'Stack type', colSpan: 2 },
          {
            title: getStackTypeLabel(cluster),
            props: { 'data-testid': 'stack-type', colSpan: 2 },
          },
        ],
      },
      {
        cells: [
          { title: 'Machine networks CIDR' },
          {
            title: cluster.machineNetworks?.map((network) => (
              <span key={network.cidr}>
                {network.cidr}
                <br />
              </span>
            )),
            props: { 'data-testid': 'machine-networks' },
          },
          isDualStack(cluster) && { title: 'Primary' },
        ],
      },
      {
        cells: [
          { title: 'API IP' },
          {
            title: cluster.apiVip,
            props: { 'data-testid': 'api-vip', colSpan: 2 },
          },
        ],
      },
      {
        cells: [
          { title: 'Ingress IP' },
          {
            title: cluster.ingressVip,
            props: { 'data-testid': 'ingress-vip', colSpan: 2 },
          },
        ],
      },
    ];
  }, [cluster]);

  const rowsAdvanced = React.useMemo(() => {
    return [
      {
        cells: [
          'Cluster network CIDR',
          {
            title: cluster.clusterNetworks?.map((network) => (
              <span key={network.cidr}>
                {network.cidr}
                <br />
              </span>
            )),
            props: { 'data-testid': 'cluster-network-cidr' },
          },
          isDualStack(cluster) && { title: 'Primary' },
        ],
      },
      {
        cells: [
          'Cluster network host prefix',
          {
            title: cluster.clusterNetworks?.map((network) => (
              <span key={network.hostPrefix}>
                {network.hostPrefix}
                <br />
              </span>
            )),
            props: { 'data-testid': 'cluster-network-prefix' },
          },
          isDualStack(cluster) && { title: 'Primary' },
        ],
      },
      {
        cells: [
          'Service network CIDR',
          {
            title: cluster.serviceNetworks?.map((network) => (
              <span key={network.cidr}>
                {network.cidr}
                <br />
              </span>
            )),
            props: { 'data-testid': 'service-network-cidr' },
          },
          isDualStack(cluster) && { title: 'Primary' },
        ],
      },
      {
        cells: [
          'Networking type',
          {
            title: getNetworkType(cluster.networkType),
            props: { 'data-testid': 'networking-type', colSpan: 2 },
          },
        ],
      },
    ];
  }, [cluster]);

  return (
    <>
      <Table
        rows={rows}
        cells={['', '', '']}
        variant={TableVariant.compact}
        borders={false}
        className={'review-table'}
      >
        <TableBody />
      </Table>

      <br />
      <Title className="pf-u-color-400" headingLevel="h4">
        Advanced networking settings
      </Title>

      <Table
        rows={rowsAdvanced}
        cells={['', '', '']}
        variant={TableVariant.compact}
        borders={false}
        className={'review-table'}
      >
        <TableBody />
      </Table>
    </>
  );
};
