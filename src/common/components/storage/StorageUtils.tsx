import * as React from 'react';
import { sortable } from '@patternfly/react-table';
import { TFunction } from 'i18next';
import { getHostRole, getInventory, Host, RoleCell, stringToJSON } from '../../index';
import { getHostRowHardwareInfo } from '../hosts/hardwareInfo';
import { ValidationsInfo } from '../../types/hosts';
import HostPropertyValidationPopover from '../hosts/HostPropertyValidationPopover';
import { TableRow } from '../hosts/AITable';

export const roleColumn = (t: TFunction, schedulableMasters: boolean): TableRow<Host> => {
  return {
    header: {
      title: 'Role',
      props: {
        id: 'col-header-role',
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const hostRole = getHostRole(host, t, schedulableMasters);
      return {
        title: <RoleCell host={host} role={hostRole} />,
        props: { 'data-testid': 'host-role' },
        sortableValue: hostRole,
      };
    },
  };
};

export const numberOfDisksColumn: TableRow<Host> = {
  header: {
    title: 'Number of disks',
    props: {
      id: 'col-header-num-disks',
    },
    transforms: [sortable],
  },
  cell: (host) => {
    const inventory = getInventory(host);
    const disks = inventory.disks || [];
    return {
      title: <> {disks.length} </>,
      props: { 'data-testid': 'host-role' },
      sortableValue: disks.length,
    };
  },
};

export const odfUsageColumn = (excludeMasters: boolean): TableRow<Host> => {
  return {
    header: {
      title: 'ODF Usage',
      props: {
        id: 'col-header-odf',
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const inventory = getInventory(host);
      const disks = inventory.disks || [];
      const isExcluded = excludeMasters && host.role === 'master';
      return {
        title: <> {isExcluded ? 'Excluded for ODF' : 'Use ODF'} </>,
        props: { 'data-testid': 'use-odf' },
        sortableValue: disks.length,
      };
    },
  };
};

export const totalStorageColumn: TableRow<Host> = {
  header: {
    title: 'Total Storage',
    props: {
      id: 'col-header-total-storage',
    },
    transforms: [sortable],
  },
  cell: (host) => {
    const inventory = getInventory(host);
    const { memory } = getHostRowHardwareInfo(inventory);
    const validationsInfo = stringToJSON<ValidationsInfo>(host.validationsInfo) || {};
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
