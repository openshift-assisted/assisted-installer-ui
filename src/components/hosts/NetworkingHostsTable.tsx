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

const getColumns = (hosts?: Host[]) => [
  { title: 'Hostname', transforms: [sortable], cellFormatters: [expandable] },
  { title: 'Role', transforms: [sortable] },
  { title: 'Status', transforms: [sortable] },
  { title: 'Active NIC', transforms: [sortable] }, // cores per machine (sockets x cores)
  { title: 'IPv4 address', transforms: [sortable] },
  { title: 'Ipv6 address', transforms: [sortable] },
  { title: 'MAC address', transforms: [sortable] },
  { title: <HostsCount hosts={hosts} inParenthesis /> },
];

const hostToHostTableRow = (openRows: OpenRows, cluster: Cluster) => (host: Host): IRow => {
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
          title: (
            <Hostname testId={`host-name`} host={host} inventory={inventory} cluster={cluster} />
          ),
          sortableValue: computedHostname || '',
        },
        {
          title: <RoleCell testId={`host-role`} host={host} readonly role={hostRole} />,
          sortableValue: hostRole,
        },
        {
          title: (
            <NetworkingStatus
              testId={`nic-status`}
              host={host}
              cluster={cluster}
              validationsInfo={validationsInfo}
            />
          ),
          sortableValue: status,
        },
        {
          title: <span data-testid={`nic-name`}>{selectedNic?.name || DASH}</span>,
          sortableValue: selectedNic?.name || DASH,
        },
        {
          title: (
            <span data-testid={`nic-ipv4-addresses`}>
              {(selectedNic?.ipv4Addresses || []).join(', ') || DASH}
            </span>
          ),
          sortableValue: (selectedNic?.ipv4Addresses || []).join(', ') || DASH,
        },
        {
          title: (
            <span data-testid={`nic-ipv6-addresses`}>
              {(selectedNic?.ipv6Addresses || []).join(', ') || DASH}
            </span>
          ),
          sortableValue: (selectedNic?.ipv6Addresses || []).join(', ') || DASH,
        },
        {
          title: <span data-testid={`nic-mac-address`}>{selectedNic?.macAddress || DASH}</span>,
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
  return <HostsTable {...props} getColumns={getColumns} hostToHostTableRow={hostToHostTableRow} />;
};

export default NetworkingHostsTable;
