import { Title } from '@patternfly/react-core';
import { Table, TableVariant, Tbody, Td, Tr } from '@patternfly/react-table';
import React from 'react';
import {
  genericTableRowKey,
  isDualStack,
  selectApiVip,
  selectIngressVip,
} from '../../../../common';
import {
  getManagementType,
  getStackTypeLabel,
  getNetworkType,
} from '../../clusterDetail/ClusterProperties';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

type ReviewTableRowsType = {
  rowId: string;
  cells: { title: string | React.ReactNode; props?: object }[];
}[];

export const ReviewNetworkingTable = ({ cluster }: { cluster: Cluster }) => {
  const rows = React.useMemo(() => {
    const networkRows = [
      {
        rowId: 'network-management',
        cells: [
          { title: 'Networking management type' },
          {
            title: getManagementType(cluster),
            props: { 'data-testid': 'networking-management-type', colSpan: 2 },
          },
        ],
      },
      {
        rowId: 'stack-type',
        cells: [
          { title: 'Stack type', colSpan: 2 },
          {
            title: getStackTypeLabel(cluster),
            props: { 'data-testid': 'stack-type', colSpan: 2 },
          },
        ],
      },
    ] as ReviewTableRowsType;

    !!cluster.machineNetworks?.length &&
      networkRows.push({
        rowId: 'machine-networks-cidr',
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
          isDualStack(cluster) ? { title: 'Primary' } : { title: '' },
        ],
      });

    cluster.apiVips &&
      cluster.apiVips.length > 0 &&
      networkRows.push({
        rowId: 'api-ip',
        cells: [
          { title: 'API IP' },
          {
            title: selectApiVip(cluster),
            props: { 'data-testid': 'api-vip', colSpan: 2 },
          },
        ],
      });

    cluster.ingressVips &&
      cluster.ingressVips.length &&
      networkRows.push({
        rowId: 'ingress-ip',
        cells: [
          { title: 'Ingress IP' },
          {
            title: selectIngressVip(cluster),
            props: { 'data-testid': 'ingress-vip', colSpan: 2 },
          },
        ],
      });

    return networkRows;
  }, [cluster]);

  const rowsAdvanced = React.useMemo(() => {
    return [
      {
        rowId: 'cluster-network-cidr',
        cells: [
          { title: 'Cluster network CIDR' },
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
        ].filter(Boolean),
      },
      {
        rowId: 'cluster-network-host-prefix',
        cells: [
          { title: 'Cluster network host prefix' },
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
        ].filter(Boolean),
      },
      {
        rowId: 'service-network-cidr',
        cells: [
          { title: 'Service network CIDR' },
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
        ].filter(Boolean),
      },
      {
        rowId: 'networking-type',
        cells: [
          { title: 'Networking type' },
          {
            title: getNetworkType(cluster.networkType),
            props: { 'data-testid': 'networking-type', colSpan: 2 },
          },
        ],
      },
    ] as ReviewTableRowsType;
  }, [cluster]);

  return (
    <>
      <Table
        variant={TableVariant.compact}
        borders={false}
        className={'review-table'}
        aria-label={'Networking review table'}
      >
        <Tbody>
          {rows.map((row, i) => (
            <Tr key={genericTableRowKey(row.rowId)}>
              {row.cells.map((cell, j) => (
                <Td key={`cell-${i}-${j}`} {...cell.props}>
                  {cell.title}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>

      <br />
      <Title className="pf-v6-u-color-400" headingLevel="h4">
        Advanced networking settings
      </Title>

      <Table
        variant={TableVariant.compact}
        borders={false}
        className={'review-table'}
        aria-label={'Advanced networking review table'}
      >
        <Tbody>
          {rowsAdvanced.map((row, i) => (
            <Tr key={genericTableRowKey(row.rowId)}>
              {row.cells.map((cell, j) => (
                <Td key={`cell-${i}-${j}`} {...cell.props}>
                  {cell.title}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  );
};
