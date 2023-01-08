import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useAlerts,
  Cluster,
  Disk,
  DiskRole,
  EventsModal,
  Host,
  HostUpdateParams,
  AddHostsContext,
  MassChangeHostnameModal,
  getInventory,
  MassDeleteHostModal,
  isSNO,
  ResourceUIState,
} from '../../../common';
import {
  AdditionalNTPSourcesDialog,
  AdditionalNTPSourcesFormProps,
} from '../../../common/components/hosts/AdditionalNTPSourcesDialog';
import { getApiErrorMessage, handleApiError, isUnknownServerError } from '../../api';
import {
  forceReload,
  setServerUpdateError,
  updateCluster,
  updateHost,
} from '../../reducers/clusters';
import { useModalDialogsContext } from './ModalDialogsContext';
import { downloadHostInstallationLogs, onAdditionalNtpSourceAction } from './utils';
import {
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
  EditHostModal,
  EditHostFormValues,
} from '../../../common/components/hosts';
import HostsTable from '../../../common/components/hosts/HostsTable';
import { hostActionResolver, hostnameColumn } from '../../../common/components/hosts/tableUtils';
import ResetHostModal from './ResetHostModal';
import DeleteHostModal from './DeleteHostModal';
import { onFetchEvents } from '../fetching/fetchEvents';
import { ClustersService, HostsService } from '../../services';
import UpdateDay2ApiVipModal from './UpdateDay2ApiVipModal';
import { UpdateDay2ApiVipFormProps } from './UpdateDay2ApiVipForm';
import { usePagination } from '../../../common/components/hosts/usePagination';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import { getErrorMessage } from '../../../common/utils';
import { selectCurrentClusterPermissionsState, selectCurrentClusterState } from '../../selectors';
import { hardwareStatusColumn } from './HardwareStatus';

export const useHostsTable = (cluster: Cluster) => {
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
          addAlert({ title: 'Failed to update ODF status', message: getErrorMessage(e) }),
        );
        if (isUnknownServerError(e as Error)) {
          dispatch(setServerUpdateError());
        }
      }
    },
    [cluster.hosts, resetCluster, dispatch, addAlert],
  );

  const onUpdateDay2ApiVip: UpdateDay2ApiVipFormProps['onUpdateDay2ApiVip'] = React.useCallback(
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
      canEditRole: (host: Host) =>
        !isViewerMode && canEditRoleUtil(cluster.status, host.status, isSNO(cluster)),
      canInstallHost: (host: Host) => !isViewerMode && canInstallHostUtil(cluster, host.status),
      canEditDisks: (host: Host) => !isViewerMode && canEditDisksUtil(cluster.status, host.status),
      canEnable: (host: Host) => !isViewerMode && canEnableUtil(cluster.status, host.status),
      canDisable: (host: Host) => !isViewerMode && canDisableUtil(cluster.status, host.status),
      canDelete: (host: Host) => !isViewerMode && canDeleteUtil(cluster.status, host.status),
      canEditHost: (host: Host) => !isViewerMode && canEditHostUtil(cluster.status, host.status),
      canReset: (host: Host) => !isViewerMode && canResetUtil(cluster.status, host.status),
      canEditHostname: () => !isViewerMode && canEditHostnameUtil(cluster.status),
    }),
    [cluster, isViewerMode],
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
        resetCluster ? void resetCluster() : dispatch(updateHost(data));
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

  const onMassDeleteHost = React.useCallback(
    () =>
      massDeleteHostDialog.open({
        hosts: (cluster.hosts || []).filter((h) => selectedHostIDs.includes(h.id)),
        onDelete: (host) => HostsService.delete(host),
        reloadCluster: () => (resetCluster ? void resetCluster() : dispatch(forceReload())),
      }),
    [massDeleteHostDialog, cluster.hosts, selectedHostIDs, resetCluster, dispatch],
  );

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

type HostsTableModalsProps = {
  cluster: Cluster;
  onReset: VoidFunction;
  onDelete: VoidFunction;
  onAdditionalNtpSource: (
    additionalNtpSource: string,
    onError: (message: string) => void,
  ) => Promise<void>;
  onUpdateDay2ApiVip: UpdateDay2ApiVipFormProps['onUpdateDay2ApiVip'];
};

export const HostsTableModals = ({
  cluster,
  onDelete,
  onReset,
  onAdditionalNtpSource,
  onUpdateDay2ApiVip,
}: HostsTableModalsProps) => {
  const dispatch = useDispatch();
  const { resetCluster } = React.useContext(AddHostsContext);
  const { uiState } = useSelector(selectCurrentClusterState);

  const { t } = useTranslation();
  const {
    eventsDialog,
    editHostDialog,
    deleteHostDialog,
    resetHostDialog,
    additionalNTPSourcesDialog,
    UpdateDay2ApiVipDialog,
    massUpdateHostnameDialog,
    massDeleteHostDialog,
  } = useModalDialogsContext();

  const content = React.useMemo(
    () => [hostnameColumn(t), hardwareStatusColumn({ isWithinModal: true })],
    [t],
  );
  const paginationProps = usePagination(massDeleteHostDialog.data?.hosts?.length || 0);

  if (uiState === ResourceUIState.UPDATE_ERROR) {
    // Do not show a modal beneath the ServerUpdateError
    return null;
  }

  return (
    <>
      {eventsDialog.isOpen && (
        <EventsModal
          isOpen
          title={`Host Events${eventsDialog.isOpen ? `: ${eventsDialog.data?.hostname}` : ''}`}
          entityKind="host"
          cluster={cluster}
          hostId={eventsDialog.data?.hostId}
          onClose={eventsDialog.close}
          onFetchEvents={onFetchEvents}
        />
      )}
      {resetHostDialog.isOpen && (
        <ResetHostModal
          isOpen
          hostname={resetHostDialog.data?.hostname}
          onClose={resetHostDialog.close}
          onReset={onReset}
        />
      )}

      {deleteHostDialog.isOpen && (
        <DeleteHostModal
          isOpen
          hostname={deleteHostDialog.data?.hostname}
          onClose={deleteHostDialog.close}
          onDelete={onDelete}
        />
      )}

      {editHostDialog.isOpen && (
        <EditHostModal
          isOpen
          host={editHostDialog.data?.host}
          inventory={editHostDialog.data?.inventory}
          usedHostnames={
            cluster?.hosts?.map((h: Host) => h.requestedHostname).filter((h) => h) as
              | string[]
              | undefined
          }
          onClose={editHostDialog.close}
          onSave={async (values: EditHostFormValues) => {
            const host = ClustersService.findHost(cluster.hosts, values.hostId);
            if (!host) {
              throw new Error(`No host found with id:${values.hostId}`);
            }

            const { data } = await HostsService.updateHostName(host, values.hostname);
            resetCluster ? void resetCluster() : dispatch(updateHost(data));
            editHostDialog.close();
          }}
          onHostSaveError={(e: Error) => {
            if (isUnknownServerError(e)) {
              dispatch(setServerUpdateError());
              editHostDialog.close();
            }
          }}
          getEditErrorMessage={(e: Error) => {
            let message = '';
            handleApiError(e, () => (message = getApiErrorMessage(e)));
            return message;
          }}
        />
      )}

      {additionalNTPSourcesDialog.isOpen && (
        <AdditionalNTPSourcesDialog
          isOpen
          additionalNtpSource={cluster.additionalNtpSource}
          onClose={additionalNTPSourcesDialog.close}
          onAdditionalNtpSource={onAdditionalNtpSource}
        />
      )}

      {UpdateDay2ApiVipDialog.isOpen && (
        <UpdateDay2ApiVipModal
          isOpen
          onClose={UpdateDay2ApiVipDialog.close}
          onUpdateDay2ApiVip={onUpdateDay2ApiVip}
          currentApiVip={cluster.apiVipDnsName}
        />
      )}
      {massUpdateHostnameDialog.isOpen && (
        <MassChangeHostnameModal
          isOpen
          onClose={massUpdateHostnameDialog.close}
          hosts={massUpdateHostnameDialog.data?.cluster?.hosts || []}
          selectedHostIDs={massUpdateHostnameDialog.data?.hostIDs || []}
          onChangeHostname={(host, hostname) => HostsService.updateHostName(host, hostname)}
          onHostSaveError={(e: Error) => {
            if (isUnknownServerError(e)) {
              dispatch(setServerUpdateError());
              editHostDialog.close();
            }
          }}
          canChangeHostname={() => [true, undefined]}
          reloadCluster={massUpdateHostnameDialog.data?.reloadCluster}
        />
      )}
      {massDeleteHostDialog.isOpen && (
        <MassDeleteHostModal
          isOpen
          onClose={massDeleteHostDialog.close}
          hosts={massDeleteHostDialog.data?.hosts || []}
          onDelete={massDeleteHostDialog.data?.onDelete}
          reloadCluster={massDeleteHostDialog.data?.reloadCluster}
        >
          <HostsTable
            hosts={massDeleteHostDialog.data?.hosts || []}
            content={content}
            {...paginationProps}
          >
            <div>No hosts selected</div>
          </HostsTable>
        </MassDeleteHostModal>
      )}
    </>
  );
};
