import { sortable } from '@patternfly/react-table';
import * as React from 'react';
import {
  getHostRole,
  getInventory,
  Host,
  hostStatus,
  MonitoredOperator,
  OPERATOR_NAME_ODF,
  RoleCell,
  stringToJSON,
} from '../../../common';
import { TableRow } from './StorageAITable';
import { getHostRowHardwareInfo } from '../../../common/components/hosts/hardwareInfo';
import { ValidationsInfo } from '../../../common/types/hosts';
import HostPropertyValidationPopover from '../../../common/components/hosts/HostPropertyValidationPopover';
import { Flex, FlexItem, Stack, StackItem } from '@patternfly/react-core';
import { UnknownIcon } from '@patternfly/react-icons';

export const ODFUsageStatus = (host: Host, isCompact?: boolean): string => {
  if (!isCompact && host.role === 'master') {
    return 'Excluded for ODF';
  }
  return 'Use ODF';
};

export const roleColumn = (schedulableMasters?: boolean): TableRow<Host> => {
  return {
    header: {
      title: 'Role',
      props: {
        id: 'col-header-role',
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const hostRole = getHostRole(host, schedulableMasters);
      return {
        title: <RoleCell host={host} role={hostRole} />,
        props: { 'data-testid': 'host-role' },
        sortableValue: hostRole,
      };
    },
  };
};

export const numberOfDisks = (): TableRow<Host> => {
  return {
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
};

export const ODFUsage = (isCompact?: boolean): TableRow<Host> => {
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
      return {
        title: <> {ODFUsageStatus(host, isCompact)} </>,
        props: { 'data-testid': 'use-odf' },
        sortableValue: disks.length,
      };
    },
  };
};

export const hardwareStatusColumn = (): TableRow<Host> => {
  return {
    header: {
      title: 'Hardware Status',
      props: {
        id: 'col-header-hwstatus',
      },
      transforms: [sortable],
    },
    cell: (host) => {
      const { title, icon } = hostStatus[host.status];
      return {
        title: (
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsXs' }}
          >
            {<FlexItem>{icon || <UnknownIcon />}</FlexItem>}
            <FlexItem>
              <Stack>
                <StackItem>{title}</StackItem>
              </Stack>
            </FlexItem>
          </Flex>
        ),
        props: { 'data-testid': 'host-hw-status' },
        sortableValue: status,
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
