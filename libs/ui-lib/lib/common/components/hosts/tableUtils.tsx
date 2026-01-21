import * as React from 'react';
import { TFunction } from 'i18next';
import type { Host } from '@openshift-assisted/types/assisted-installer-service';
import { ActionsResolver } from './AITable';
import { HostsTableActions } from './types';
import { getHostname, getInventory } from './utils';

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
    t,
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
  }: HostsTableActions & { t: TFunction }): ActionsResolver<Host> =>
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
                title: t('ai:Change hostname'),
                id: `button-edit-host-${hostname}`, // id is everchanging, not ideal for tests
                onClick: () => onEditHost(host),
              });
          } else {
            const [enabled, reason] = canEdit;
            actions.push({
              title: (
                <ActionTitle
                  disabled={!enabled}
                  description={reason}
                  title={t('ai:Change hostname')}
                />
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
          title: t('ai:Enable in cluster'),
          id: `button-enable-in-cluster-${hostname}`,
          onClick: () => onHostEnable(host),
        });
      }
      if (onHostDisable && canDisable?.(host)) {
        actions.push({
          title: t('ai:Disable in cluster'),
          id: `button-disable-in-cluster-${hostname}`,
          onClick: () => onHostDisable(host),
        });
      }
      if (onHostReset && canReset?.(host)) {
        actions.push({
          title: t('ai:Reset host'),
          id: `button-reset-host-${hostname}`,
          onClick: () => onHostReset(host),
        });
      }
      if (onViewHostEvents) {
        actions.push({
          title: t('ai:View host events'),
          id: `button-view-host-events-${hostname}`,
          onClick: () => onViewHostEvents(host),
        });
      }
      if (onDownloadHostLogs && canDownloadHostLogs?.(host)) {
        actions.push({
          title: t('ai:Download host logs'),
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
                title: t('ai:Remove host'),
                id: `button-delete-host-${hostname}`,
                onClick: () => onDeleteHost(host),
              });
          } else {
            const [enabled, reason] = canDeleteHost;
            actions.push({
              title: (
                <ActionTitle disabled={!enabled} description={reason} title={t('ai:Remove host')} />
              ),
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
            title: (
              <ActionTitle disabled={!enabled} description={reason} title={t('ai:Edit BMC')} />
            ),
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
            <ActionTitle
              disabled={!enabled}
              description={reason}
              title={t('ai:Remove from the cluster')}
            />
          ),
          id: `button-unbind-host-${hostname}`,
          onClick: () => onUnbindHost(host),
          isDisabled: !enabled,
        });
      }
    }

    return actions;
  };
