import * as React from 'react';
import { sortable } from '@patternfly/react-table';
import { TFunction } from 'i18next';
import { getHostRole, getInventory, Host, RoleCell } from '../../index';
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
      const isMaster = host.role === 'master' || host.suggestedRole === 'master';
      const isExcluded = excludeMasters && isMaster;
      return {
        title: isExcluded ? (
          <div style={{ color: 'var(--pf-global--disabled-color--100)' }}>Excluded for ODF</div>
        ) : (
          'Use ODF'
        ),
        props: { 'data-testid': 'use-odf' },
        sortableValue: disks.length,
      };
    },
  };
};
