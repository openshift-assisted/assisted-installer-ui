import React from 'react';
import { sortable, expandable } from '@patternfly/react-table';
import { Address4, Address6 } from 'ip-address';

import { getSubnet } from '../clusterConfiguration/utils';
import { Cluster, Host, Interface, Inventory, stringToJSON } from '../../api';
import { ValidationsInfo } from '../../types/hosts';
import { DASH } from '../constants';

import { HostDetail } from './HostRowDetail';
import { HostsTableProps } from './HostsTable';
import { getHostname, getHostRole } from './utils';
import Hostname from './Hostname';
import HostsCount from './HostsCount';
import RoleCell, { RoleCellProps } from './RoleCell';

export const getSelectedNic = (nics: Interface[], currentSubnet: Address4 | Address6) => {
  return nics.find((nic) => {
    const ipv4Addresses = (nic.ipv4Addresses || []).reduce<Address4[]>((addresses, address) => {
      if (Address4.isValid(address)) {
        addresses.push(new Address4(address));
      }
      return addresses;
    }, []);

    if (ipv4Addresses.find((address) => address.isInSubnet(currentSubnet))) {
      return true;
    }

    const ipv6Addresses = (nic.ipv6Addresses || []).reduce<Address6[]>((addresses, address) => {
      if (Address6.isValid(address)) {
        addresses.push(new Address6(address));
      }
      return addresses;
    }, []);

    return ipv6Addresses.find((address) => address.isInSubnet(currentSubnet));
  });
};

export const getColumns = (cluster: Cluster) => [
  { title: 'Hostname', transforms: [sortable], cellFormatters: [expandable] },
  { title: 'Role', transforms: [sortable] },
  { title: 'Status', transforms: [sortable] },
  { title: 'Active NIC', transforms: [sortable] }, // cores per machine (sockets x cores)
  { title: 'IPv4 address', transforms: [sortable] },
  { title: 'IPv6 address', transforms: [sortable] },
  { title: 'MAC address', transforms: [sortable] },
  { title: <HostsCount cluster={cluster} inParenthesis /> },
];

export type HostNetworkingStatusComponentProps = {
  cluster: Cluster;
  host: Host;
  validationsInfo: ValidationsInfo;
  onEditHostname?: () => void;
};

type HostToHostTableRow = (
  cluster: Cluster,
  HostNetworkingStatusComponent: React.FC<HostNetworkingStatusComponentProps>,
) => HostsTableProps['hostToHostTableRow'];

export const hostToHostTableRow: HostToHostTableRow = (cluster, HostNetworkingStatusComponent) => ({
  openRows,
  AdditionalNTPSourcesDialogToggleComponent,
  canEditDisks,
  onEditHostname,
  canEditRole,
  onEditRole,
  onDiskRole,
}) => (host) => {
  const { id, status, inventory: inventoryString = '' } = host;
  const validationsInfo = stringToJSON<ValidationsInfo>(host.validationsInfo) || {};

  const inventory = stringToJSON<Inventory>(inventoryString) || {};
  const nics = inventory.interfaces || [];

  const currentSubnet = cluster.machineNetworkCidr ? getSubnet(cluster.machineNetworkCidr) : null;
  const selectedNic = currentSubnet ? getSelectedNic(nics, currentSubnet) : null;

  const computedHostname = getHostname(host, inventory);
  const hostRole = getHostRole(host);

  const editHostname = onEditHostname ? () => onEditHostname(host, inventory) : undefined;

  const onEditHostRole: RoleCellProps['onEditRole'] = onEditRole
    ? (role) => onEditRole(host, role)
    : undefined;

  return [
    {
      // visible row
      isOpen: !!openRows[id],
      cells: [
        {
          title: <Hostname host={host} inventory={inventory} onEditHostname={editHostname} />,
          props: { 'data-testid': 'host-name' },
          sortableValue: computedHostname || '',
        },
        {
          title: (
            <RoleCell
              host={host}
              readonly={!onEditRole || !canEditRole || !canEditRole(host)}
              onEditRole={onEditHostRole}
              role={hostRole}
            />
          ),
          props: { 'data-testid': 'host-role' },
          sortableValue: hostRole,
        },
        {
          title: (
            <HostNetworkingStatusComponent
              cluster={cluster}
              host={host}
              onEditHostname={editHostname}
              validationsInfo={validationsInfo}
            />
          ),
          props: { 'data-testid': 'nic-status' },
          sortableValue: status,
        },
        {
          title: selectedNic?.name || DASH,
          props: { 'data-testid': 'nic-name' },
          sortableValue: selectedNic?.name || DASH,
        },
        {
          title: (selectedNic?.ipv4Addresses || []).join(', ') || DASH,
          props: { 'data-testid': 'nic-ipv4' },
          sortableValue: (selectedNic?.ipv4Addresses || []).join(', ') || DASH,
        },
        {
          title: (selectedNic?.ipv6Addresses || []).join(', ') || DASH,
          props: { 'data-testid': 'nic-ipv6' },
          sortableValue: (selectedNic?.ipv6Addresses || []).join(', ') || DASH,
        },
        {
          title: selectedNic?.macAddress || DASH,
          props: { 'data-testid': 'nic-mac-address' },
          sortableValue: selectedNic?.macAddress || DASH,
        },
      ],
      host,
      clusterStatus: cluster.status,
      inventory,
      key: `${host.id}-master`,
    },
    {
      // expandable detail
      // parent will be set after sorting
      fullWidth: true,
      cells: [
        {
          title: (
            <HostDetail
              key={id}
              canEditDisks={canEditDisks}
              onDiskRole={onDiskRole}
              inventory={inventory}
              host={host}
              validationsInfo={validationsInfo}
              AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleComponent}
            />
          ),
        },
      ],
      key: `${host.id}-detail`,
      inventory,
    },
  ];
};
