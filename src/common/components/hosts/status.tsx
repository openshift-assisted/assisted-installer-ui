import * as React from 'react';
import {
  AddCircleOIcon,
  BanIcon,
  CheckCircleIcon,
  ConnectedIcon,
  DisconnectedIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InProgressIcon,
  LinkIcon,
  PendingIcon,
  PlusIcon,
} from '@patternfly/react-icons';
import {
  global_danger_color_100 as dangerColor,
  global_warning_color_100 as warningColor,
  global_success_color_100 as okColor,
  chart_color_blue_300 as blueColor,
} from '@patternfly/react-tokens';
import { Host } from '../../api';
import { HostStatus } from './types';

export const hostStatus: HostStatus<Host['status']> = Object.freeze({
  'unbinding-pending-user-action': {
    key: 'unbinding-pending-user-action',
    title: 'Removing from cluster',
    category: 'Discovery related',
    icon: <InProgressIcon />,
    details:
      'This host is being removed from the cluster. To finish, reboot the host with the infrastructure environment ISO.',
  },
  reclaiming: {
    key: 'reclaiming',
    title: 'Returning to the infrastructure environment',
    category: 'Discovery related',
    icon: <InProgressIcon />,
    details: 'This host is being removed from the cluster.',
  },
  'reclaiming-rebooting': {
    key: 'reclaiming-rebooting',
    title: 'Rebooting while returning to the infrastructure environment',
    category: 'Discovery related',
    icon: <InProgressIcon />,
    details: 'This host is being rebooted to be available for reuse in another cluster.',
  },
  'preparing-failed': {
    key: 'preparing-failed',
    title: 'Preparing step failed',
    category: 'Installation related',
    details: 'Preparing step failed',
  },
  unbinding: {
    key: 'unbinding',
    title: 'Removing from cluster',
    category: 'Discovery related',
    icon: <InProgressIcon />,
    details: 'This host is being removed from the cluster.',
  },
  'disabled-unbound': {
    key: 'disabled-unbound',
    title: 'Disabled',
    category: 'Discovery related',
    icon: <BanIcon />,
    details:
      'This host was manually removed from a cluster and can not be included in another one. Enable this host to make it available again.',
  },
  'disconnected-unbound': {
    key: 'disconnected-unbound',
    title: 'Disconnected',
    category: 'Discovery related',
    icon: <DisconnectedIcon />,
    details: 'Ensure the host is running, responsive, and is able to contact the installer.',
  },
  'discovering-unbound': {
    key: 'discovering-unbound',
    title: 'Discovering',
    category: 'Discovery related',
    icon: <ConnectedIcon />,
    details:
      'This host is transmitting its hardware and networking information to the installer. Please wait while this information is received.',
  },
  'insufficient-unbound': {
    key: 'insufficient-unbound',
    title: 'Insufficient',
    category: 'Discovery related',
    icon: <ExclamationTriangleIcon color={warningColor.value} />,
    details:
      'This host does not meet the minimum hardware or networking requirements and can not be included in the cluster.',
  },
  'known-unbound': {
    key: 'known-unbound',
    title: 'Available',
    category: 'Discovery related',
    icon: <PlusIcon color={blueColor.value} />,
    details:
      'This host meets the minimum hardware and networking requirements and can be included in the cluster.',
  },
  binding: {
    key: 'binding',
    title: 'Binding',
    category: 'Discovery related',
    icon: <LinkIcon />,
    details: 'This host is being added to the cluster.',
  },
  discovering: {
    key: 'discovering',
    title: 'Discovering',
    category: 'Discovery related',
    icon: <ConnectedIcon />,
    details:
      'This host is transmitting its hardware and networking information to the installer. Please wait while this information is received.',
  },
  'pending-for-input': {
    key: 'pending-for-input',
    title: 'Pending input',
    category: 'Discovery related',
    icon: <PendingIcon />,
  },
  known: {
    key: 'known',
    title: 'Ready',
    category: 'Discovery related',
    icon: <CheckCircleIcon color={okColor.value} />,
    details:
      'This host meets the minimum hardware and networking requirements and will be included in the cluster.',
  },
  disconnected: {
    key: 'disconnected',
    title: 'Disconnected',
    category: 'Discovery related',
    icon: <DisconnectedIcon />,
    details:
      'This host has lost its connection to the installer and will not be included in the cluster unless connectivity is restored.',
  },
  insufficient: {
    key: 'insufficient',
    title: 'Insufficient',
    category: 'Discovery related',
    icon: <ExclamationTriangleIcon color={warningColor.value} />,
    details:
      'This host does not meet the minimum hardware or networking requirements and will not be included in the cluster.',
  },
  disabled: {
    key: 'disabled',
    title: 'Disabled',
    category: 'Discovery related',
    icon: <BanIcon />,
    details:
      'This host was manually disabled and will not be included in the cluster. Enable this host to include it again.',
  },
  'preparing-for-installation': {
    key: 'preparing-for-installation',
    title: 'Preparing for installation',
    category: 'Installation related',
    icon: <InProgressIcon />,
  },
  'preparing-successful': {
    key: 'preparing-successful',
    title: 'Preparing step successful',
    category: 'Installation related',
    icon: <InProgressIcon />,
  },
  installing: {
    key: 'installing',
    title: 'Starting installation',
    category: 'Installation related',
    icon: <InProgressIcon />,
  },
  'installing-in-progress': {
    key: 'installing-in-progress',
    title: 'Installing',
    category: 'Installation related',
    icon: <InProgressIcon />,
    withProgress: true,
  },
  'installing-pending-user-action': {
    key: 'installing-pending-user-action',
    title: 'Pending user action',
    category: 'Installation related',
    icon: <ExclamationTriangleIcon color={warningColor.value} />,
    details: 'This host is pending user action',
  },
  installed: {
    key: 'installed',
    title: 'Installed',
    category: 'Installation related',
    icon: <CheckCircleIcon color={okColor.value} />,
    details: 'This host completed its installation successfully.',
  },
  cancelled: {
    key: 'cancelled',
    title: 'Installation cancelled',
    category: 'Installation related',
    icon: <BanIcon />,
    details: 'This host installation has been cancelled.',
    withProgress: true,
  },
  error: {
    key: 'error',
    title: 'Error',
    category: 'Installation related',
    icon: <ExclamationCircleIcon color={dangerColor.value} />,
    details: 'This host failed its installation.',
    withProgress: true,
  },
  resetting: {
    key: 'resetting',
    title: 'Resetting',
    category: 'Installation related',
    icon: <InProgressIcon />,
    details: 'This host is resetting the installation.',
  },
  'resetting-pending-user-action': {
    key: 'resetting-pending-user-action',
    title: 'Reboot required',
    category: 'Installation related',
    icon: <ExclamationTriangleIcon color={warningColor.value} />,
    details:
      'Host already booted from disk during previous installation. To finish resetting the installation please boot the host into Discovery ISO.',
  },
  'added-to-existing-cluster': {
    key: 'added-to-existing-cluster',
    title: 'Installed',
    category: 'Installation related',
    icon: <AddCircleOIcon />,
    details: 'This host completed its installation successfully.',
  },
});
