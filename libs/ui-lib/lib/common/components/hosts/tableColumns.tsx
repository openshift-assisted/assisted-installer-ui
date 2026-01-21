import React from 'react';
import { TFunction } from 'i18next';
import { Address4, Address6 } from 'ip-address';
import {
  Cluster,
  Host,
  HostUpdateParams,
  Interface,
} from '@openshift-assisted/types/assisted-installer-service';
import type { ValidationsInfo as HostValidationsInfo } from '../../types/hosts';
import { getSubnet } from '../clusterConfiguration';
import { LabelGroup, Label } from '@patternfly/react-core';
import { selectMachineNetworkCIDR } from '../../selectors';
import { stringToJSON } from '../../utils';
import { DASH } from '../constants';
import { getDateTimeCell } from '../ui';
import { TableRow } from './AITable';
import { getHostRowHardwareInfo } from './hardwareInfo';
import Hostname from './Hostname';
import HostPropertyValidationPopover from './HostPropertyValidationPopover';
import HostsCount from './HostsCount';
import HostStatus from './HostStatus';
import RoleCell from './RoleCell';
import { hostStatus } from './status';
import { HostsTableActions } from './types';
import {
  getInventory,
  getHostname,
  getHostRole,
  areOnlySoftValidationsFailing,
  getHostStatus,
  getHostLabels,
} from './utils';

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

export const hostnameColumn = (
  t: TFunction,
  onEditHostname?: HostsTableActions['onEditHost'],
  hosts?: Host[],
  canEditHostname?: HostsTableActions['canEditHostname'],
): TableRow<Host> => {
  return {
    header: {
      title: t<string>('ai:Hostname'),
      props: {
        id: 'col-header-hostname', // ACM jest tests require id over testId
      },
      sort: true,
    },
    cell: (host) => {
      const inventory = getInventory(host);
      const editHostname = onEditHostname ? () => onEditHostname(host) : undefined;
      const computedHostname = getHostname(host, inventory);
      return {
        title: (
          <Hostname
            host={host}
            inventory={inventory}
            onEditHostname={editHostname}
            hosts={hosts}
            readonly={canEditHostname ? !canEditHostname(host) : false}
          />
        ),
        props: { 'data-testid': 'host-name' },
        sortableValue: computedHostname || '',
      };
    },
  };
};

export const roleColumn = (
  t: TFunction,
  canEditRole?: HostsTableActions['canEditRole'],
  onEditRole?: HostsTableActions['onEditRole'],
  schedulableMasters?: boolean,
  clusterKind?: Cluster['kind'],
): TableRow<Host> => {
  return {
    header: {
      title: t<string>('ai:Role'),
      props: {
        id: 'col-header-role',
      },
      sort: true,
    },
    cell: (host) => {
      const editRole = onEditRole
        ? (role: HostUpdateParams['hostRole']) => onEditRole(host, role)
        : undefined;
      const isRoleEditable = canEditRole?.(host);
      const hostRole = getHostRole(host, t, schedulableMasters, clusterKind);
      return {
        title: (
          <RoleCell host={host} readonly={!isRoleEditable} role={hostRole} onEditRole={editRole} />
        ),
        props: { 'data-testid': 'host-role' },
        sortableValue: hostRole,
      };
    },
  };
};

export const statusColumn = (
  t: TFunction,
  clusterStatus: Cluster['status'],
  AdditionalNTPSourcesDialogToggleComponent?: React.FC,
  onEditHostname?: HostsTableActions['onEditHost'],
  UpdateDay2ApiVipDialogToggleComponent?: React.FC,
): TableRow<Host> => {
  return {
    header: {
      title: t<string>('ai:Status'),
      props: {
        id: 'col-header-status',
      },
      sort: true,
    },
    cell: (host) => {
      const validationsInfo = stringToJSON<HostValidationsInfo>(host.validationsInfo) || {};
      const editHostname = onEditHostname ? () => onEditHostname(host) : undefined;
      const sublabel =
        areOnlySoftValidationsFailing(validationsInfo) &&
        ['known', 'known-unbound'].includes(host.status)
          ? t<string>('ai:Some validations failed')
          : undefined;

      const actualHostStatus = getHostStatus(host.status, clusterStatus);

      return {
        title: (
          <HostStatus
            host={host}
            status={{ ...hostStatus(t)[actualHostStatus], sublabel }}
            onEditHostname={editHostname}
            validationsInfo={validationsInfo}
            AdditionalNTPSourcesDialogToggleComponent={AdditionalNTPSourcesDialogToggleComponent}
            UpdateDay2ApiVipDialogToggleComponent={UpdateDay2ApiVipDialogToggleComponent}
          />
        ),
        props: { 'data-testid': 'host-status' },
        sortableValue: host.status,
      };
    },
  };
};

export const discoveredAtColumn = (t: TFunction): TableRow<Host> => ({
  header: {
    title: t<string>('ai:Discovered on'),
    props: {
      id: 'col-header-discoveredat',
    },
    sort: true,
  },
  cell: (host) => {
    const { createdAt } = host;
    const dateTimeCell = getDateTimeCell(createdAt);
    return {
      title: dateTimeCell.title,
      props: { 'data-testid': 'host-discovered-time' },
      sortableValue: dateTimeCell.sortableValue,
    };
  },
});

export const cpuArchitectureColumn = (t: TFunction): TableRow<Host> => ({
  header: {
    title: t<string>('ai:CPU Architecture'),
    props: {
      id: 'col-header-cpuarchitecture',
    },
    sort: true,
  },
  cell: (host) => {
    const inventory = getInventory(host);
    return {
      title: inventory.cpu?.architecture,
      props: { 'data-testid': 'host-cpu-architecture' },
      sortableValue: inventory.cpu?.architecture,
    };
  },
});

export const cpuCoresColumn = (t: TFunction): TableRow<Host> => ({
  header: {
    title: t<string>('ai:CPU Cores'),
    props: {
      id: 'col-header-cpucores',
    },
    sort: true,
  },
  cell: (host) => {
    const inventory = getInventory(host);
    const { cores } = getHostRowHardwareInfo(inventory);
    const validationsInfo = stringToJSON<HostValidationsInfo>(host.validationsInfo) || {};
    const cpuCoresValidation = validationsInfo?.hardware?.find(
      (v) => v.id === 'has-cpu-cores-for-role',
    );
    return {
      title: (
        <HostPropertyValidationPopover validation={cpuCoresValidation}>
          {cores.title}
        </HostPropertyValidationPopover>
      ),
      props: { 'data-testid': 'host-cpu-cores' },
      sortableValue: cores.sortableValue,
    };
  },
});

export const memoryColumn = (t: TFunction): TableRow<Host> => ({
  header: {
    title: t<string>('ai:Memory'),
    props: {
      id: 'col-header-memory',
    },
    sort: true,
  },
  cell: (host) => {
    const inventory = getInventory(host);
    const { memory } = getHostRowHardwareInfo(inventory);
    const validationsInfo = stringToJSON<HostValidationsInfo>(host.validationsInfo) || {};
    const memoryValidation = validationsInfo?.hardware?.find((v) => v.id === 'has-memory-for-role');
    return {
      title: (
        <HostPropertyValidationPopover validation={memoryValidation}>
          {memory.title}
        </HostPropertyValidationPopover>
      ),
      props: { 'data-testid': 'host-memory' },
      sortableValue: memory.sortableValue,
    };
  },
});

export const disksColumn = (t: TFunction): TableRow<Host> => ({
  header: {
    title: t<string>('ai:Total storage'),
    props: {
      id: 'col-header-disk',
    },
    sort: true,
  },
  cell: (host) => {
    const inventory = getInventory(host);
    const { disk } = getHostRowHardwareInfo(inventory);
    const validationsInfo = stringToJSON<HostValidationsInfo>(host.validationsInfo) || {};
    const diskValidation = validationsInfo?.hardware?.find((v) => v.id === 'has-min-valid-disks');
    return {
      title: (
        <HostPropertyValidationPopover validation={diskValidation}>
          {disk.title}
        </HostPropertyValidationPopover>
      ),
      props: { 'data-testid': 'host-disks' },
      sortableValue: disk.sortableValue,
    };
  },
});

export const gpusColumn = (t: TFunction): TableRow<Host> => ({
  header: {
    title: t<string>('ai:GPUs'),
    props: {
      id: 'col-header-gpus',
    },
    sort: true,
  },
  cell: (host) => {
    const { gpus } = getInventory(host);
    return {
      title: <>{gpus?.length ?? '--'}</>,
      props: { 'data-testid': 'host-gpus' },
      sortableValue: gpus?.length ?? 0,
    };
  },
});

export const countColumn = (cluster: Cluster): TableRow<Host> => ({
  header: { title: <HostsCount cluster={cluster} inParenthesis /> },
});

export const activeNICColumn = (cluster: Cluster, t: TFunction): TableRow<Host> => ({
  header: {
    title: t<string>('ai:Active NIC'),
    sort: true,
  },
  cell: (host) => {
    const inventory = getInventory(host);
    const nics = inventory.interfaces || [];
    const machineNetworkCidr = selectMachineNetworkCIDR(cluster);
    const currentSubnet = machineNetworkCidr ? getSubnet(machineNetworkCidr) : null;
    const selectedNic = currentSubnet ? getSelectedNic(nics, currentSubnet) : null;
    return {
      title: selectedNic?.name || DASH,
      props: { 'data-testid': 'nic-name' },
      sortableValue: selectedNic?.name || DASH,
    };
  },
});

export const ipv4Column = (cluster: Cluster): TableRow<Host> => ({
  header: {
    title: 'IPv4 address',
    sort: true,
  },
  cell: (host) => {
    const inventory = getInventory(host);
    const nics = inventory.interfaces || [];

    const machineNetworkCidr = selectMachineNetworkCIDR(cluster);
    const currentSubnet = machineNetworkCidr ? getSubnet(machineNetworkCidr) : null;
    const selectedNic = currentSubnet ? getSelectedNic(nics, currentSubnet) : null;
    return {
      title: (selectedNic?.ipv4Addresses || []).join(', ') || DASH,
      props: { 'data-testid': 'nic-ipv4' },
      sortableValue: (selectedNic?.ipv4Addresses || []).join(', ') || DASH,
    };
  },
});

export const ipv6Column = (cluster: Cluster): TableRow<Host> => ({
  header: {
    title: 'IPv6 address',
    sort: true,
  },
  cell: (host) => {
    const inventory = getInventory(host);
    const nics = inventory.interfaces || [];

    const machineNetworkCidr = selectMachineNetworkCIDR(cluster);
    const currentSubnet = machineNetworkCidr ? getSubnet(machineNetworkCidr) : null;
    const selectedNic = currentSubnet ? getSelectedNic(nics, currentSubnet) : null;
    return {
      title: (selectedNic?.ipv6Addresses || []).join(', ') || DASH,
      props: { 'data-testid': 'nic-ipv6' },
      sortableValue: (selectedNic?.ipv6Addresses || []).join(', ') || DASH,
    };
  },
});

export const macAddressColumn = (cluster: Cluster): TableRow<Host> => ({
  header: {
    title: 'MAC address',
    sort: true,
  },
  cell: (host) => {
    const inventory = getInventory(host);
    const nics = inventory.interfaces || [];

    const machineNetworkCidr = selectMachineNetworkCIDR(cluster);
    const currentSubnet = machineNetworkCidr ? getSubnet(machineNetworkCidr) : null;
    const selectedNic = currentSubnet ? getSelectedNic(nics, currentSubnet) : null;
    return {
      title: selectedNic?.macAddress || DASH,
      props: { 'data-testid': 'nic-mac-address' },
      sortableValue: selectedNic?.macAddress || DASH,
    };
  },
});

export const labelsColumn = (t: TFunction): TableRow<Host> => ({
  header: {
    title: t<string>('ai:Labels'),
    props: {
      id: 'col-header-labels',
    },
    sort: false,
  },
  cell: (host) => {
    const labels = getHostLabels(host);
    return {
      title:
        Object.entries(labels).length > 0 ? (
          <LabelGroup>
            {Object.entries(labels).map(([key, value], index) => (
              <Label key={`${host.id}-host-label-${index}`} isCompact>
                {key} = {value}
              </Label>
            ))}
          </LabelGroup>
        ) : (
          '--'
        ),
      props: { 'data-testid': 'host-labels' },
    };
  },
});
