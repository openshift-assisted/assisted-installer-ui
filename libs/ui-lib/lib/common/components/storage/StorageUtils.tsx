import * as React from 'react';
import { TFunction } from 'i18next';
import { getHostRole, getInventory, RoleCell, UiIcon } from '../../index';
import { TableRow } from '../hosts/AITable';
import { Popover, Content, ContentVariants } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { Host } from '@openshift-assisted/types/assisted-installer-service';

const SkipFormattingDisks = () => (
  <Content>
    <Content component={ContentVariants.p}>Some bootable disks will skip formatting</Content>
  </Content>
);

export const roleColumn = (t: TFunction, schedulableMasters: boolean): TableRow<Host> => {
  return {
    header: {
      title: 'Role',
      props: {
        id: 'col-header-role',
      },
      sort: true,
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
    sort: true,
  },
  cell: (host) => {
    const inventory = getInventory(host);
    const disks = inventory.disks || [];
    return {
      title: (
        <>
          {' '}
          {disks.length}
          {'   '}
          {host.skipFormattingDisks && (
            <Popover bodyContent={<SkipFormattingDisks />} minWidth="20rem" maxWidth="30rem">
              <UiIcon size="sm" status="warning" icon={<ExclamationTriangleIcon />} />
            </Popover>
          )}
        </>
      ),
      props: { 'data-testid': 'disk-number' },
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
      sort: true,
    },
    cell: (host) => {
      const isMaster = host.role === 'master' || host.suggestedRole === 'master';
      const isExcluded = excludeMasters && isMaster;
      return {
        title: isExcluded ? (
          <div
            style={{
              color: 'var(--pf-t--global--icon--color--disabled)',
            }}
          >
            Excluded for ODF
          </div>
        ) : (
          'Use ODF'
        ),
        props: { 'data-testid': 'use-odf' },
        sortableValue: Number(isExcluded),
      };
    },
  };
};
