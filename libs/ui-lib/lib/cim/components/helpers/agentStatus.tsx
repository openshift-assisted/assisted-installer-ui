import * as React from 'react';
import { ConnectedIcon } from '@patternfly/react-icons/dist/js/icons/connected-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { global_danger_color_100 as dangerColor } from '@patternfly/react-tokens/dist/js/global_danger_color_100';
import { hostStatus } from '../../../common';
import { HostStatus } from '../../../common/components/hosts/types';
import { TFunction } from 'i18next';

export const bmhStatus = (t: TFunction): HostStatus<string> => ({
  'bmh-error': {
    key: 'bmh-error',
    title: t('ai:Error'),
    category: 'Bare Metal Host related',
  },
  registering: {
    key: 'registering',
    title: t('ai:Registering'),
    category: 'Bare Metal Host related',
  },
  provisioning: {
    key: 'provisioning',
    title: t('ai:Provisioning'),
    category: 'Bare Metal Host related',
  },
  provisioned: {
    key: 'provisioned',
    title: t('ai:Provisioned'),
    category: 'Bare Metal Host related',
  },
  deprovisioning: {
    key: 'deprovisioning',
    title: t('ai:Deprovisioning'),
    category: 'Bare Metal Host related',
  },
  inspecting: {
    key: 'inspecting',
    title: t('ai:Inspecting'),
    category: 'Bare Metal Host related',
  },
  pending: {
    key: 'pending',
    title: t('ai:Pending'),
    category: 'Bare Metal Host related',
  },
});

export const agentStatus = (t: TFunction): HostStatus<string> => ({
  ...hostStatus(t),
  discovered: {
    key: 'discovered',
    title: t('ai:Discovered'),
    icon: <ConnectedIcon />,
    noPopover: true,
    category: 'Discovery related',
    details: t('ai:The host has been discovered and needs to be approved to before further use.'),
  },
  ...bmhStatus(t),
  specSyncErr: {
    key: 'specSyncErr',
    title: t('ai:Sync error'),
    icon: <ExclamationCircleIcon color={dangerColor.value} />,
    category: 'Discovery related',
  },
});
