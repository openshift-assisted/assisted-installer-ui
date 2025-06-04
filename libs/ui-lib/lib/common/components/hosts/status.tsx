import * as React from 'react';
import { BanIcon } from '@patternfly/react-icons/dist/js/icons/ban-icon';
import { CheckCircleIcon } from '@patternfly/react-icons/dist/js/icons/check-circle-icon';
import { ConnectedIcon } from '@patternfly/react-icons/dist/js/icons/connected-icon';
import { DisconnectedIcon } from '@patternfly/react-icons/dist/js/icons/disconnected-icon';
import { ExclamationCircleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';
import { InProgressIcon } from '@patternfly/react-icons/dist/js/icons/in-progress-icon';
import { LinkIcon } from '@patternfly/react-icons/dist/js/icons/link-icon';
import { PendingIcon } from '@patternfly/react-icons/dist/js/icons/pending-icon';
import { PlusIcon } from '@patternfly/react-icons/dist/js/icons/plus-icon';
import { t_global_icon_color_status_danger_default as dangerColor } from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_danger_default';
import { t_global_icon_color_status_warning_default as warningColor } from '@patternfly/react-tokens/dist/js/t_global_icon_color_status_warning_default';
import { t_global_color_status_success_default as okColor } from '@patternfly/react-tokens/dist/js/t_global_color_status_success_default';
import { chart_color_blue_300 as blueColor } from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import { Host } from '@openshift-assisted/types/assisted-installer-service';
import { HostStatus } from './types';
import { TFunction } from 'i18next';

export const hostStatus = (t: TFunction): HostStatus<Host['status'] | 'finalizing'> =>
  Object.freeze({
    'unbinding-pending-user-action': {
      key: 'unbinding-pending-user-action',
      title: t('ai:Removing from cluster'),
      category: 'Discovery related',
      icon: <InProgressIcon />,
      details: t(
        'ai:This host is being removed from the cluster. To finish, reboot the host with the infrastructure environment ISO.',
      ),
    },
    reclaiming: {
      key: 'reclaiming',
      title: t('ai:Returning to the infrastructure environment'),
      category: 'Discovery related',
      icon: <InProgressIcon />,
      details: t('ai:This host is being removed from the cluster.'),
    },
    'reclaiming-rebooting': {
      key: 'reclaiming-rebooting',
      title: t('ai:Rebooting while returning to the infrastructure environment'),
      category: 'Discovery related',
      icon: <InProgressIcon />,
      details: t('ai:This host is being rebooted to be available for reuse in another cluster.'),
    },
    'preparing-failed': {
      key: 'preparing-failed',
      title: t('ai:Preparing step failed'),
      category: 'Installation related',
      details: t('ai:Preparing step failed'),
    },
    unbinding: {
      key: 'unbinding',
      title: t('ai:Removing from cluster'),
      category: 'Discovery related',
      icon: <InProgressIcon />,
      details: t('ai:This host is being removed from the cluster.'),
    },
    'disabled-unbound': {
      key: 'disabled-unbound',
      title: t('ai:Disabled'),
      category: 'Discovery related',
      icon: <BanIcon />,
      details: t(
        'ai:This host was manually removed from a cluster and can not be included in another one. Enable this host to make it available again.',
      ),
    },
    'disconnected-unbound': {
      key: 'disconnected-unbound',
      title: t('ai:Disconnected'),
      category: 'Discovery related',
      icon: <DisconnectedIcon />,
      details: t(
        'ai:Ensure the host is running, responsive, and is able to contact the installer.',
      ),
    },
    'discovering-unbound': {
      key: 'discovering-unbound',
      title: t('ai:Discovering'),
      category: 'Discovery related',
      icon: <ConnectedIcon />,
      details: t(
        'ai:This host is transmitting its hardware and networking information to the installer. Please wait while this information is received.',
      ),
    },
    'insufficient-unbound': {
      key: 'insufficient-unbound',
      title: t('ai:Insufficient'),
      category: 'Discovery related',
      icon: <ExclamationTriangleIcon color={warningColor.value} />,
      details: t(
        'ai:This host does not meet the minimum hardware or networking requirements and can not be included in the cluster.',
      ),
    },
    'known-unbound': {
      key: 'known-unbound',
      title: t('ai:Available'),
      category: 'Discovery related',
      icon: <PlusIcon color={blueColor.value} />,
      details: t(
        'ai:This host meets the minimum hardware and networking requirements and can be included in the cluster.',
      ),
    },
    binding: {
      key: 'binding',
      title: t('ai:Binding'),
      category: 'Discovery related',
      icon: <LinkIcon />,
      details: t('ai:This host is being added to the cluster.'),
    },
    discovering: {
      key: 'discovering',
      title: t('ai:Discovering'),
      category: 'Discovery related',
      icon: <ConnectedIcon />,
      details: t(
        'ai:This host is transmitting its hardware and networking information to the installer. Please wait while this information is received.',
      ),
    },
    'pending-for-input': {
      key: 'pending-for-input',
      title: t('ai:Pending input'),
      category: 'Discovery related',
      icon: <PendingIcon />,
    },
    known: {
      key: 'known',
      title: t('ai:Ready'),
      category: 'Discovery related',
      icon: <CheckCircleIcon color={okColor.value} />,
      details: t(
        'ai:This host meets the minimum hardware and networking requirements and will be included in the cluster.',
      ),
    },
    disconnected: {
      key: 'disconnected',
      title: t('ai:Disconnected'),
      category: 'Discovery related',
      icon: <DisconnectedIcon />,
      details: t(
        'ai:This host has lost its connection to the installer and will not be included in the cluster unless connectivity is restored.',
      ),
    },
    insufficient: {
      key: 'insufficient',
      title: t('ai:Insufficient'),
      category: 'Discovery related',
      icon: <ExclamationTriangleIcon color={warningColor.value} />,
      details: t(
        'ai:This host does not meet the minimum hardware or networking requirements and will not be included in the cluster.',
      ),
    },
    disabled: {
      key: 'disabled',
      title: t('ai:Disabled'),
      category: 'Discovery related',
      icon: <BanIcon />,
      details: t(
        'ai:This host was manually disabled and will not be included in the cluster. Enable this host to include it again.',
      ),
    },
    'preparing-for-installation': {
      key: 'preparing-for-installation',
      title: t('ai:Preparing for installation'),
      category: 'Installation related',
      icon: <InProgressIcon />,
    },
    'preparing-successful': {
      key: 'preparing-successful',
      title: t('ai:Preparing step successful'),
      category: 'Installation related',
      icon: <InProgressIcon />,
    },
    installing: {
      key: 'installing',
      title: t('ai:Starting installation'),
      category: 'Installation related',
      icon: <InProgressIcon />,
    },
    'installing-in-progress': {
      key: 'installing-in-progress',
      title: t('ai:Installing'),
      category: 'Installation related',
      icon: <InProgressIcon />,
      withProgress: true,
    },
    'installing-pending-user-action': {
      key: 'installing-pending-user-action',
      title: t('ai:Pending user action'),
      category: 'Installation related',
      icon: <ExclamationTriangleIcon color={warningColor.value} />,
      details: t('ai:This host is pending user action'),
    },
    installed: {
      key: 'installed',
      title: t('ai:Installed'),
      category: 'Installation related',
      icon: <CheckCircleIcon color={okColor.value} />,
      details: t('ai:This host completed its installation successfully.'),
    },
    cancelled: {
      key: 'cancelled',
      title: t('ai:Installation cancelled'),
      category: 'Installation related',
      icon: <BanIcon />,
      details: t('ai:This host installation has been cancelled.'),
      withProgress: true,
    },
    error: {
      key: 'error',
      title: t('ai:Error'),
      category: 'Installation related',
      icon: <ExclamationCircleIcon color={dangerColor.value} />,
      details: t('ai:This host failed its installation.'),
      withProgress: true,
    },
    resetting: {
      key: 'resetting',
      title: t('ai:Resetting'),
      category: 'Installation related',
      icon: <InProgressIcon />,
      details: t('ai:This host is resetting the installation.'),
    },
    'resetting-pending-user-action': {
      key: 'resetting-pending-user-action',
      title: t('ai:Reboot required'),
      category: 'Installation related',
      icon: <ExclamationTriangleIcon color={warningColor.value} />,
      details: t(
        'ai:Host has already been booted from disk during the previous installation. To finish resetting the installation, boot the host into the discovery image',
      ),
    },
    finalizing: {
      key: 'finalizing',
      title: t('ai:Finalizing'),
      category: 'Installation related',
      icon: <InProgressIcon />,
    },
    'added-to-existing-cluster': {
      key: 'added-to-existing-cluster',
      title: t('ai:Installed'),
      category: 'Installation related',
      icon: <CheckCircleIcon color={okColor.value} />,
      details: t('ai:This host completed its installation successfully.'),
    },
  });

export const hostStatusOrder: Host['status'][] = [
  'error',
  'cancelled',
  'disconnected',
  'disconnected-unbound',
  'insufficient',
  'insufficient-unbound',
  'installing-pending-user-action',
  'resetting-pending-user-action',
  'unbinding-pending-user-action',
  'resetting',
  'disabled',
  'disabled-unbound',
  'pending-for-input',
  'added-to-existing-cluster',
  'unbinding',
  'binding',
  'known',
  'known-unbound',
  'reclaiming',
  'reclaiming-rebooting',
  'preparing-failed',
  'preparing-for-installation',
  'preparing-successful',
  'discovering',
  'discovering-unbound',
  'installing',
  'installing-in-progress',
  'installed',
];
