import * as React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons';
import { hostStatus } from '../../../common';
import { HostStatus } from '../../../common/components/hosts/types';

export const bmhStatus: HostStatus<string> = {
  'bmh-error': {
    key: 'bmh-error',
    title: 'Provisioning error',
    category: 'Bare Metal Host related',
  },
  registering: {
    key: 'registering',
    title: 'Registering',
    category: 'Bare Metal Host related',
  },
  provisioning: {
    key: 'provisioning',
    title: 'Provisioning',
    category: 'Bare Metal Host related',
  },
  provisioned: {
    key: 'provisioned',
    title: 'Provisioned',
    category: 'Bare Metal Host related',
  },
};

export const agentStatus: HostStatus<string> = {
  ...hostStatus,
  discovered: {
    key: 'discovered',
    title: 'Discovered',
    icon: <ConnectedIcon />,
    noPopover: true,
    category: 'Discovery related',
    details: 'The host has been discovered and needs to be approved to before further use.',
  },
  ...bmhStatus,
};
