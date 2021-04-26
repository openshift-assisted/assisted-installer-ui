import React from 'react';
import { IRow, sortable, expandable } from '@patternfly/react-table';
import { Cluster, Host, Interface, Inventory } from '../../api/types';
import { HostsTable } from '.';
import { HostDetail } from './HostRowDetail';
import { OpenRows } from './HostsTable';
import { stringToJSON } from '../../api/utils';
import { ValidationsInfo } from '../../types/hosts';
import { getHostname, getHostRole } from './utils';
import Hostname from './Hostname';
import { DASH } from '../constants';
import { HostsNotShowingLinkProps } from '../clusterConfiguration/DiscoveryTroubleshootingModal';
import HostsCount from './HostsCount';
import NetworkingStatus from './NetworkingStatus';
import { getSubnet } from '../clusterConfiguration/utils';
import { Address4, Address6 } from 'ip-address';
import RoleCell from './RoleCell';

const getSelectedNic = (nics: Interface[], currentSubnet: Address4 | Address6) => {
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

const getColumns = (cluster: Cluster) => [
  { title: 'Hostname', transforms: [sortable], cellFormatters: [expandable] },
  { title: 'Role', transforms: [sortable] },
  { title: 'Status', transforms: [sortable] },
  { title: 'Active NIC', transforms: [sortable] }, // cores per machine (sockets x cores)
  { title: 'IPv4 address', transforms: [sortable] },
  { title: 'Ipv6 address', transforms: [sortable] },
  { title: 'MAC address', transforms: [sortable] },
  { title: <HostsCount cluster={cluster} inParenthesis /> },
];

const hostToHostTableRow = (openRows: OpenRows, cluster: Cluster) => (host: Host): IRow[] => {
  const { id, status, inventory: inventoryString = '' } = host;
  const inventory = stringToJSON<Inventory>(inventoryString) || {};
  const validationsInfo = stringToJSON<ValidationsInfo>(host.validationsInfo) || {};
  const nics = inventory.interfaces || [];

  const currentSubnet = cluster.machineNetworkCidr ? getSubnet(cluster.machineNetworkCidr) : null;
  const selectedNic = currentSubnet ? getSelectedNic(nics, currentSubnet) : null;

  const computedHostname = getHostname(host, inventory);
  const hostRole = getHostRole(host);

  return [
    {
      // visible row
      isOpen: !!openRows[id],
      cells: [
        {
          title: <Hostname host={host} inventory={inventory} cluster={cluster} />,
          props: { 'data-testid': 'host-name' },
          sortableValue: computedHostname || '',
        },
        {
          title: <RoleCell host={host} readonly role={hostRole} />,
          props: { 'data-testid': 'host-role' },
          sortableValue: hostRole,
        },
        {
          title: (
            <NetworkingStatus host={host} cluster={cluster} validationsInfo={validationsInfo} />
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
              cluster={cluster}
              inventory={inventory}
              host={host}
              validationsInfo={validationsInfo}
            />
          ),
        },
      ],
      key: `${host.id}-detail`,
      inventory,
    },
  ];
};

type NetworkingHostsTableProps = {
  cluster: Cluster;
  skipDisabled?: boolean;
  setDiscoveryHintModalOpen?: HostsNotShowingLinkProps['setDiscoveryHintModalOpen'];
};

const NetworkingHostsTable: React.FC<NetworkingHostsTableProps> = (props) => {
  return (
    <HostsTable
      {...props}
      testId={'networking-host-table'}
      getColumns={getColumns}
      hostToHostTableRow={hostToHostTableRow}
    />
  );
};

export default NetworkingHostsTable;
