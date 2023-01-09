import { breakWord, expandable, sortable } from '@patternfly/react-table';
import * as React from 'react';
import { Address4, Address6 } from 'ip-address';
import { Cluster, Host, HostUpdateParams, Interface, stringToJSON } from '../../api';
import { ValidationsInfo as HostValidationsInfo } from '../../types/hosts';
import { getSubnet } from '../clusterConfiguration';
import { DASH } from '../constants';
import { getDateTimeCell } from '../ui';
import { ActionsResolver, TableRow } from './AITable';
import { getHostRowHardwareInfo } from './hardwareInfo';
import Hostname from './Hostname';
import HostPropertyValidationPopover from './HostPropertyValidationPopover';
import HostsCount from './HostsCount';
import { HostsTableActions } from './types';
import HostStatus from './HostStatus';
import RoleCell from './RoleCell';
import { areOnlySoftValidationsFailing, getHostname, getHostRole, getInventory } from './utils';
import { selectMachineNetworkCIDR } from '../../selectors/clusterSelectors';
import { hostStatus } from './status';
import { DropdownProps } from '@patternfly/react-core';
import { TFunction } from 'i18next';

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
      title: t('ai:Hostname'),
      props: {
        id: 'col-header-hostname', // ACM jest tests require id over testId
      },
      transforms: [sortable],
      cellFormatters: [expandable],
      cellTransforms: [breakWord],
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
            readonly={canEditHostname ? !canEditHostname() : false}
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
  position?: DropdownProps['position'],
): TableRow<Host> => {
  return {
    header: {
      title: t('ai:Role'),
      props: {
        id: 'col-header-role',
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const editRole = onEditRole
        ? (role: HostUpdateParams['hostRole']) => onEditRole(host, role)
        : undefined;
      const isRoleEditable = canEditRole?.(host);
      const hostRole = getHostRole(host, t, schedulableMasters);
      return {
        title: (
          <RoleCell
            host={host}
            readonly={!isRoleEditable}
            role={hostRole}
            onEditRole={editRole}
            position={position}
          />
        ),
        props: { 'data-testid': 'host-role' },
        sortableValue: hostRole,
      };
    },
  };
};

export const statusColumn = (
  t: TFunction,
  AdditionalNTPSourcesDialogToggleComponent?: React.FC,
  onEditHostname?: HostsTableActions['onEditHost'],
  UpdateDay2ApiVipDialogToggleComponent?: React.FC,
): TableRow<Host> => {
  return {
    header: {
      title: t('ai:Status'),
      props: {
        id: 'col-header-status',
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const validationsInfo = stringToJSON<HostValidationsInfo>(host.validationsInfo) || {};
      const editHostname = onEditHostname ? () => onEditHostname(host) : undefined;
      const sublabel =
        areOnlySoftValidationsFailing(validationsInfo) &&
        ['known', 'known-unbound'].includes(host.status)
          ? 'Some validations failed'
          : undefined;
      return {
        title: (
          <HostStatus
            host={host}
            status={{ ...hostStatus[host.status], sublabel }}
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

export const discoveredAtColumn: TableRow<Host> = {
  header: {
    title: 'Discovered on',
    props: {
      id: 'col-header-discoveredat',
    },
    transforms: [sortable],
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
};

export const cpuArchitectureColumn = (t: TFunction): TableRow<Host> => ({
  header: {
    title: t('ai:CPU Architecture'),
    props: {
      id: 'col-header-cpuarchitecture',
    },
    transforms: [sortable],
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

export const cpuCoresColumn: TableRow<Host> = {
  header: {
    title: 'CPU Cores',
    props: {
      id: 'col-header-cpucores',
    },
    transforms: [sortable],
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
};

export const memoryColumn: TableRow<Host> = {
  header: {
    title: 'Memory',
    props: {
      id: 'col-header-memory',
    },
    transforms: [sortable],
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
};

export const disksColumn: TableRow<Host> = {
  header: {
    title: 'Total storage',
    props: {
      id: 'col-header-disk',
    },
    transforms: [sortable],
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
};

export const countColumn = (cluster: Cluster): TableRow<Host> => ({
  header: { title: <HostsCount cluster={cluster} inParenthesis /> },
});

export const activeNICColumn = (cluster: Cluster): TableRow<Host> => ({
  header: { title: 'Active NIC', transforms: [sortable] },
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
  header: { title: 'IPv4 address', transforms: [sortable] },
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
  header: { title: 'IPv6 address', transforms: [sortable] },
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
  header: { title: 'MAC address', transforms: [sortable] },
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

const ActionTitle: React.FC<{ disabled: boolean; description?: string; title: string }> = ({
  title,
  description,
  disabled,
}) => (
  <>
    {title}
    {disabled && (
      <>
        <br />
        {description}
      </>
    )}
  </>
);

export const hostActionResolver =
  ({
    onInstallHost,
    canInstallHost,
    onEditHost,
    canEditHost,
    onHostEnable,
    canEnable,
    onHostDisable,
    canDisable,
    onHostReset,
    canReset,
    onViewHostEvents,
    onDownloadHostLogs,
    canDownloadHostLogs,
    onDeleteHost,
    canDelete,
    onEditBMH,
    canEditBMH,
    canUnbindHost,
    onUnbindHost,
  }: HostsTableActions): ActionsResolver<Host> =>
  (host) => {
    const actions = [];
    if (host) {
      const inventory = getInventory(host);
      const hostname = getHostname(host, inventory);

      if (onInstallHost && canInstallHost?.(host)) {
        actions.push({
          title: 'Install host',
          id: `button-install-host-${hostname}`,
          onClick: () => onInstallHost(host),
        });
      }
      if (onEditHost) {
        if (canEditHost) {
          const canEdit = canEditHost(host);
          if (typeof canEdit === 'boolean') {
            canEdit &&
              actions.push({
                title: 'Change hostname',
                id: `button-edit-host-${hostname}`, // id is everchanging, not ideal for tests
                onClick: () => onEditHost(host),
              });
          } else {
            const [enabled, reason] = canEdit;
            actions.push({
              title: (
                <ActionTitle disabled={!enabled} description={reason} title="Change hostname" />
              ),
              id: `button-edit-host-${hostname}`, // id is everchanging, not ideal for tests
              onClick: () => onEditHost(host),
              isDisabled: !enabled,
            });
          }
        }
      }
      if (onHostEnable && canEnable?.(host)) {
        actions.push({
          title: 'Enable in cluster',
          id: `button-enable-in-cluster-${hostname}`,
          onClick: () => onHostEnable(host),
        });
      }
      if (onHostDisable && canDisable?.(host)) {
        actions.push({
          title: 'Disable in cluster',
          id: `button-disable-in-cluster-${hostname}`,
          onClick: () => onHostDisable(host),
        });
      }
      if (onHostReset && canReset?.(host)) {
        actions.push({
          title: 'Reset host',
          id: `button-reset-host-${hostname}`,
          onClick: () => onHostReset(host),
        });
      }
      if (onViewHostEvents) {
        actions.push({
          title: 'View host events',
          id: `button-view-host-events-${hostname}`,
          onClick: () => onViewHostEvents(host),
        });
      }
      if (onDownloadHostLogs && canDownloadHostLogs?.(host)) {
        actions.push({
          title: 'Download host logs',
          id: `button-download-host-installation-logs-${hostname}`,
          onClick: () => onDownloadHostLogs(host),
        });
      }
      if (onDeleteHost) {
        if (canDelete) {
          const canDeleteHost = canDelete(host);
          if (typeof canDeleteHost === 'boolean') {
            canDeleteHost &&
              actions.push({
                title: 'Delete host',
                id: `button-delete-host-${hostname}`,
                onClick: () => onDeleteHost(host),
              });
          } else {
            const [enabled, reason] = canDeleteHost;
            actions.push({
              title: <ActionTitle disabled={!enabled} description={reason} title="Delete host" />,
              id: `button-delete-host-${hostname}`,
              onClick: () => onDeleteHost(host),
              isDisabled: !enabled,
            });
          }
        }
      }
      if (onEditBMH && host.href === 'bmc') {
        if (canEditBMH) {
          const [enabled, reason] = canEditBMH(host);
          actions.push({
            title: <ActionTitle disabled={!enabled} description={reason} title="Edit BMC" />,
            id: `button-edit-bmh-host-${hostname}`,
            onClick: () => onEditBMH(host),
            isDisabled: !enabled,
          });
        }
      }

      if (onUnbindHost && canUnbindHost) {
        const [enabled, reason] = canUnbindHost(host);
        actions.push({
          title: (
            <ActionTitle disabled={!enabled} description={reason} title="Remove from the cluster" />
          ),
          id: `button-unbind-host-${hostname}`,
          onClick: () => onUnbindHost(host),
          isDisabled: !enabled,
        });
      }
    }

    return actions;
  };
