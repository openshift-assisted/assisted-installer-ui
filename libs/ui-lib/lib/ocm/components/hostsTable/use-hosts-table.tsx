import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Cluster,
  Disk,
  DiskRole,
  Host,
  HostUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import {
  useAlerts,
  AddHostsContext,
  getInventory,
  isSNO,
  hostActionResolver,
  AdditionalNTPSourcesFormProps,
  getApiErrorMessage,
  handleApiError,
  isUnknownServerError,
  useTranslation,
  canEditDisks as canEditDisksUtil,
  canEditRole as canEditRoleUtil,
  canInstallHost as canInstallHostUtil,
  canEnable as canEnableUtil,
  canDisable as canDisableUtil,
  canDelete as canDeleteUtil,
  canEditHost as canEditHostUtil,
  canEditHostname as canEditHostnameUtil,
  canDownloadHostLogs,
  canReset as canResetUtil,
} from '../../../common';
import {
  forceReload,
  setServerUpdateError,
  updateCluster,
  updateHost,
  selectCurrentClusterPermissionsState,
} from '../../store';
import { useFeature } from '../../hooks';
import { ClustersService, HostsService } from '../../services';
import { downloadHostInstallationLogs, onAdditionalNtpSourceAction } from './utils';
import { UpdateDay2ApiVipModalProps, useModalDialogsContext } from './modals';

export const useHostsTable = (cluster: Cluster) => {
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  const { addAlert } = useAlerts();
  const {
    eventsDialog,
    editHostDialog,
    deleteHostDialog,
    resetHostDialog,
    massUpdateHostnameDialog,
    massDeleteHostDialog,
  } = useModalDialogsContext();
  const { resetCluster } = React.useContext(AddHostsContext);
  const { isViewerMode } = useSelector(selectCurrentClusterPermissionsState);
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const hostActions = React.useMemo(
    () => ({
      onDeleteHost: (host: Host) => {
        const inventory = getInventory(host);
        deleteHostDialog.open({
          hostId: host.id,
          hostname: (host?.requestedHostname || inventory?.hostname) as string,
        });
      },
      onInstallHost: async (host: Host) => {
        const hostId = host.id;
        try {
          const { data } = await HostsService.install(host);
          resetCluster ? void resetCluster() : dispatch(updateHost(data));
        } catch (e) {
          handleApiError(e, () =>
            addAlert({ title: `Failed to enable host ${hostId}`, message: getApiErrorMessage(e) }),
          );
        }
      },
    }),
    [dispatch, resetCluster, addAlert, deleteHostDialog],
  );

  const onViewHostEvents = React.useCallback(
    (host: Host) => {
      const { id, requestedHostname } = host;
      const inventory = getInventory(host);
      const hostname = requestedHostname || inventory?.hostname || id;
      eventsDialog.open({ hostId: id, hostname });
    },
    [eventsDialog],
  );

  const onEditHost = React.useCallback(
    (host: Host) => {
      const inventory = getInventory(host);
      editHostDialog.open({ host, inventory });
    },
    [editHostDialog],
  );

  const onHostReset = React.useCallback(
    (host: Host) => {
      const inventory = getInventory(host);
      const hostname = host?.requestedHostname || inventory?.hostname || '';
      resetHostDialog.open({ hostId: host.id, hostname });
    },
    [resetHostDialog],
  );

  const onDownloadHostLogs = React.useCallback(
    (host: Host) => {
      void downloadHostInstallationLogs(addAlert, host);
    },
    [addAlert],
  );

  const onDiskRole = React.useCallback(
    async (hostId: Host['id'], diskId: Disk['id'], role: DiskRole) => {
      try {
        if (!diskId) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(`Cannot update disk role in host ${hostId}\nMissing diskId`);
        }

        const host = ClustersService.findHost(cluster.hosts, hostId);
        if (!host) {
          throw new Error(`No host found with id:${hostId}`);
        }

        const { data } = await HostsService.updateDiskRole(host, diskId, role);

        resetCluster ? void resetCluster() : dispatch(updateHost(data));
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to set disk role', message: getApiErrorMessage(e) }),
        );
        if (isUnknownServerError(e as Error)) {
          dispatch(setServerUpdateError());
        }
      }
    },
    [dispatch, resetCluster, addAlert, cluster.hosts],
  );

  const onExcludedODF = React.useCallback(
    async (hostId: Host['id'], nodeLabels: HostUpdateParams['nodeLabels']) => {
      try {
        const host = ClustersService.findHost(cluster.hosts, hostId);
        if (!host) {
          throw new Error(`No host found with id:${hostId}`);
        }

        const { data } = await HostsService.updateHostODF(host, nodeLabels);
        resetCluster ? await resetCluster() : dispatch(updateHost(data));
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to update ODF status', message: getApiErrorMessage(e) }),
        );
        if (isUnknownServerError(e as Error)) {
          dispatch(setServerUpdateError());
        }
      }
    },
    [cluster.hosts, resetCluster, dispatch, addAlert],
  );

  const onUpdateDay2ApiVip: UpdateDay2ApiVipModalProps['onUpdateDay2ApiVip'] = React.useCallback(
    async (apiVip: string, onError: (message: string) => void) => {
      try {
        const { data } = await ClustersService.update(cluster.id, cluster.tags, {
          apiVipDnsName: apiVip,
        });
        dispatch(updateCluster(data));
      } catch (e) {
        handleApiError(e, () => onError(getApiErrorMessage(e)));
        if (isUnknownServerError(e as Error)) {
          dispatch(setServerUpdateError());
        }
      }
    },
    [cluster.id, cluster.tags, dispatch],
  );

  const onAdditionalNtpSource: AdditionalNTPSourcesFormProps['onAdditionalNtpSource'] =
    React.useMemo(
      () =>
        async (...args) =>
          await onAdditionalNtpSourceAction(dispatch, cluster, ...args),
      [cluster, dispatch],
    );

  const updateDiskSkipFormatting = React.useCallback(
    async (shouldFormatDisk: boolean, hostId: Host['id'], diskId: Disk['id']) => {
      try {
        if (!cluster.id) {
          throw new Error(
            `Failed to update disks skip formatting state in host ${hostId}\nMissing cluster id`,
          );
        }
        if (!diskId) {
          throw new Error(
            `Failed to update disks skip formatting state in host ${hostId}\nMissing disk id`,
          );
        }

        const host = ClustersService.findHost(cluster.hosts, hostId);
        if (!host) {
          throw new Error(`No host found with id:${hostId}`);
        }

        const { data } = await HostsService.updateFormattingDisks(host, diskId, !shouldFormatDisk);
        resetCluster ? void resetCluster() : dispatch(updateHost(data));
      } catch (e) {
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to set disks skip formatting',
            message: getApiErrorMessage(e),
          }),
        );
        if (isUnknownServerError(e as Error)) {
          dispatch(setServerUpdateError());
        }
      }
    },
    [dispatch, addAlert, cluster, resetCluster],
  );

  const actionChecks = React.useMemo(
    () => ({
      canEditRole: (host: Host) => {
        if (isSingleClusterFeatureEnabled && host.bootstrap) {
          return false;
        }
        return !isViewerMode && canEditRoleUtil(cluster.status, host.status, isSNO(cluster));
      },
      canInstallHost: (host: Host) => !isViewerMode && canInstallHostUtil(cluster, host.status),
      canEditDisks: (host: Host) => !isViewerMode && canEditDisksUtil(cluster.status, host.status),
      canEnable: (host: Host) => !isViewerMode && canEnableUtil(cluster.status, host.status),
      canDisable: (host: Host) => !isViewerMode && canDisableUtil(cluster.status, host.status),
      canDelete: (host: Host) => !isViewerMode && canDeleteUtil(cluster.status, host.status),
      canEditHost: (host: Host) => !isViewerMode && canEditHostUtil(cluster.status, host.status),
      canReset: (host: Host) => !isViewerMode && canResetUtil(cluster.status, host.status),
      canEditHostname: (host?: Host) => !isViewerMode && canEditHostnameUtil(cluster.status, host),
    }),
    [cluster, isViewerMode, isSingleClusterFeatureEnabled],
  );

  const onReset = React.useCallback(() => {
    const reset = async (hostId: string | undefined) => {
      if (hostId) {
        try {
          const host = ClustersService.findHost(cluster.hosts, hostId);
          if (!host) {
            throw new Error(`No host found with id:${hostId}`);
          }

          const { data } = await HostsService.reset(host);
          resetCluster ? void resetCluster() : dispatch(updateHost(data));
        } catch (e) {
          handleApiError(e, () =>
            addAlert({
              title: `Failed to reset host ${hostId}`,
              message: getApiErrorMessage(e),
            }),
          );
        }
      }
    };
    void reset(resetHostDialog.data?.hostId);
    resetHostDialog.close();
  }, [addAlert, cluster.hosts, dispatch, resetCluster, resetHostDialog]);

  const onDelete = React.useCallback(() => {
    const deleteHost = async (hostId: string | undefined) => {
      if (hostId) {
        try {
          const host = ClustersService.findHost(cluster.hosts, hostId);
          if (!host) {
            throw new Error(`No host found with id:${hostId}`);
          }

          await HostsService.delete(host);
          resetCluster ? void resetCluster() : dispatch(forceReload());
        } catch (e) {
          handleApiError(e, () =>
            addAlert({
              title: `Failed to delete host ${hostId}`,
              message: getApiErrorMessage(e),
            }),
          );
        }
      }
    };
    void deleteHost(deleteHostDialog.data?.hostId);
    deleteHostDialog.close();
  }, [deleteHostDialog, cluster.hosts, resetCluster, dispatch, addAlert]);

  const onEditRole = React.useCallback(
    async (host: Host, role: HostUpdateParams['hostRole']) => {
      try {
        if (!host.clusterId) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(`Failed to edit role in host: ${host.id}.\nMissing cluster_id`);
        }
        const { data } = await HostsService.updateRole(host, role);

        if (resetCluster) {
          void resetCluster();
        } else {
          dispatch(updateHost(data));
          // Reload to obtain cluster-level validations that may be affected by role change
          dispatch(forceReload());
        }
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to set role', message: getApiErrorMessage(e) }),
        );
        if (isUnknownServerError(e as Error)) {
          dispatch(setServerUpdateError());
        }
      }
    },
    [addAlert, dispatch, resetCluster],
  );

  const actionResolver = React.useMemo(
    () =>
      hostActionResolver({
        t,
        ...actionChecks,
        onEditRole,
        onDiskRole,
        onExcludedODF,
        onEditHost,
        onHostReset,
        onDownloadHostLogs,
        onViewHostEvents,
        canDownloadHostLogs,
        ...hostActions,
      }),
    [
      t,
      actionChecks,
      hostActions,
      onEditRole,
      onDiskRole,
      onEditHost,
      onHostReset,
      onDownloadHostLogs,
      onExcludedODF,
      onViewHostEvents,
    ],
  );

  const [selectedHostIDs, setSelectedHostIDs] = React.useState<string[]>([]);
  const onSelect = React.useCallback(
    (obj: Host, isSelected: boolean) => {
      if (isSelected) {
        setSelectedHostIDs([...selectedHostIDs, obj.id]);
      } else {
        setSelectedHostIDs(selectedHostIDs.filter((sh) => sh !== obj.id));
      }
    },
    [selectedHostIDs],
  );
  const onMassChangeHostname = React.useCallback(() => {
    if (selectedHostIDs.length === 1) {
      const host = cluster.hosts?.find((host) => host.id === selectedHostIDs[0]);
      return host && onEditHost(host);
    }
    return massUpdateHostnameDialog.open({
      hostIDs: selectedHostIDs,
      cluster,
      reloadCluster: () => (resetCluster ? void resetCluster() : dispatch(forceReload())),
    });
  }, [selectedHostIDs, massUpdateHostnameDialog, cluster, onEditHost, resetCluster, dispatch]);

  const onMassDeleteHost = React.useCallback(() => {
    if (selectedHostIDs.length === 1) {
      const host = cluster.hosts?.find((host) => host.id === selectedHostIDs[0]);

      return (
        host &&
        deleteHostDialog.open({
          hostId: host.id,
          hostname: host?.requestedHostname as string,
        })
      );
    } else {
      return massDeleteHostDialog.open({
        hosts: (cluster.hosts || []).filter((h) => selectedHostIDs.includes(h.id)),
        onDelete: (host) => HostsService.delete(host),
        reloadCluster: () => (resetCluster ? void resetCluster() : dispatch(forceReload())),
      });
    }
  }, [
    selectedHostIDs,
    cluster.hosts,
    deleteHostDialog,
    massDeleteHostDialog,
    resetCluster,
    dispatch,
  ]);

  return {
    onDiskRole,
    onEditHost,
    actionChecks,
    onEditRole,
    actionResolver,
    onReset,
    onDelete,
    onAdditionalNtpSource,
    onUpdateDay2ApiVip,
    onSelect: isViewerMode ? undefined : onSelect,
    selectedHostIDs,
    setSelectedHostIDs,
    onMassChangeHostname,
    onMassDeleteHost,
    updateDiskSkipFormatting,
  };
};
