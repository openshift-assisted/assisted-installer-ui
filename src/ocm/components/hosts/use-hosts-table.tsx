import * as React from 'react';
import { useDispatch } from 'react-redux';
import {
  useAlerts,
  Cluster,
  Disk,
  DiskRole,
  EventsModal,
  Host,
  Inventory,
  stringToJSON,
  HostUpdateParams,
  AddHostsContext,
  MassChangeHostnameModal,
} from '../../../common';
import {
  AdditionalNTPSourcesDialog,
  AdditionalNTPSourcesFormProps,
} from '../../../common/components/hosts/AdditionalNTPSourcesDialog';
import { getErrorMessage, handleApiError } from '../../api';
import { forceReload, updateCluster, updateHost } from '../../reducers/clusters';
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
import { hostActionResolver } from '../../../common/components/hosts/tableUtils';
import ResetHostModal from './ResetHostModal';
import DeleteHostModal from './DeleteHostModal';
import { onFetchEvents } from '../fetching/fetchEvents';
import { HostsService } from '../../services';
import UpdateDay2ApiVipModal from './UpdateDay2ApiVipModal';
import { UpdateDay2ApiVipFormProps } from './UpdateDay2ApiVipForm';
import { ClustersAPI } from '../../services/apis';

export const useHostsTable = (cluster: Cluster) => {
  const { addAlert } = useAlerts();
  const {
    eventsDialog,
    editHostDialog,
    deleteHostDialog,
    resetHostDialog,
    massUpdateHostnameDialog,
  } = useModalDialogsContext();
  const { resetCluster } = React.useContext(AddHostsContext);

  const dispatch = useDispatch();

  const hostActions = React.useMemo(
    () => ({
      onDeleteHost: (host: Host) => {
        const { inventory: inventoryString = '' } = host;
        const inventory = stringToJSON<Inventory>(inventoryString) || {};
        deleteHostDialog.open({
          hostId: host.id,
          hostname: (host?.requestedHostname || inventory?.hostname) as string,
        });
      },
      onInstallHost: async (host: Host) => {
        const hostId = host.id;
        try {
          const { data } = await HostsService.install(cluster.id, hostId);
          resetCluster ? resetCluster() : dispatch(updateHost(data));
        } catch (e) {
          handleApiError(e, () =>
            addAlert({ title: `Failed to enable host ${hostId}`, message: getErrorMessage(e) }),
          );
        }
      },
    }),
    [cluster.id, dispatch, resetCluster, addAlert, deleteHostDialog],
  );

  const onViewHostEvents = React.useCallback(
    (host: Host) => {
      const { id, requestedHostname, inventory: inventoryString = '' } = host;
      const inventory = stringToJSON<Inventory>(inventoryString) || {};
      const hostname = requestedHostname || inventory?.hostname || id;
      eventsDialog.open({ hostId: id, hostname });
    },
    [eventsDialog],
  );

  const onEditHost = React.useCallback(
    (host: Host) => {
      const { inventory: inventoryString = '' } = host;
      const inventory = stringToJSON<Inventory>(inventoryString) || {};
      editHostDialog.open({ host, inventory });
    },
    [editHostDialog],
  );

  const onHostReset = React.useCallback(
    (host: Host) => {
      const { inventory: inventoryString = '' } = host;
      const inventory = stringToJSON<Inventory>(inventoryString) || {};
      const hostname = host?.requestedHostname || inventory?.hostname || '';
      resetHostDialog.open({ hostId: host.id, hostname });
    },
    [resetHostDialog],
  );

  const onDownloadHostLogs = React.useCallback(
    (host: Host) => downloadHostInstallationLogs(addAlert, host),
    [addAlert],
  );

  const onDiskRole = React.useCallback(
    async (hostId: Host['id'], diskId: Disk['id'], role: DiskRole) => {
      try {
        if (!diskId) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(`Cannot update disk role in host ${hostId}\nMissing diskId`);
        }

        const { data } = await HostsService.updateDiskRole(cluster.id, hostId, diskId, role);
        resetCluster ? resetCluster() : dispatch(updateHost(data));
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to set disk role', message: getErrorMessage(e) }),
        );
      }
    },
    [dispatch, resetCluster, addAlert, cluster.id],
  );

  const onUpdateDay2ApiVip: UpdateDay2ApiVipFormProps['onUpdateDay2ApiVip'] = React.useCallback(
    async (apiVip: string, onError: (message: string) => void) => {
      try {
        const { data } = await ClustersAPI.update(cluster.id, {
          apiVipDnsName: apiVip,
        });
        dispatch(updateCluster(data));
      } catch (e) {
        handleApiError(e, () => onError(getErrorMessage(e)));
      }
    },
    [cluster.id, dispatch],
  );

  const onAdditionalNtpSource: AdditionalNTPSourcesFormProps['onAdditionalNtpSource'] = React.useMemo(
    () => async (...args) => await onAdditionalNtpSourceAction(dispatch, cluster.id, ...args),
    [cluster.id, dispatch],
  );

  const actionChecks = React.useMemo(
    () => ({
      canEditRole: (host: Host) => canEditRoleUtil(cluster, host.status),
      canInstallHost: (host: Host) => canInstallHostUtil(cluster, host.status),
      canEditDisks: (host: Host) => canEditDisksUtil(cluster.status, host.status),
      canEnable: (host: Host) => canEnableUtil(cluster.status, host.status),
      canDisable: (host: Host) => canDisableUtil(cluster.status, host.status),
      canDelete: (host: Host) => canDeleteUtil(cluster.status, host.status),
      canEditHost: (host: Host) => canEditHostUtil(cluster.status, host.status),
      canReset: (host: Host) => canResetUtil(cluster.status, host.status),
      canEditHostname: () => canEditHostnameUtil(cluster.status),
    }),
    [cluster],
  );

  const onReset = React.useCallback(() => {
    const reset = async (hostId: string | undefined) => {
      if (hostId) {
        try {
          const { data } = await HostsService.reset(cluster.id, hostId);
          resetCluster ? resetCluster() : dispatch(updateHost(data));
        } catch (e) {
          return handleApiError(e, () =>
            addAlert({
              title: `Failed to reset host ${hostId}`,
              message: getErrorMessage(e),
            }),
          );
        }
      }
    };
    reset(resetHostDialog.data?.hostId);
    resetHostDialog.close();
  }, [addAlert, cluster.id, dispatch, resetCluster, resetHostDialog]);

  const onDelete = React.useCallback(() => {
    const deleteHost = async (hostId: string | undefined) => {
      if (hostId) {
        try {
          await HostsService.delete(cluster.id, hostId);
          resetCluster ? resetCluster() : dispatch(forceReload());
        } catch (e) {
          return handleApiError(e, () =>
            addAlert({
              title: `Failed to delete host ${hostId}`,
              message: getErrorMessage(e),
            }),
          );
        }
      }
    };
    deleteHost(deleteHostDialog.data?.hostId);
    deleteHostDialog.close();
  }, [addAlert, cluster.id, dispatch, resetCluster, deleteHostDialog]);

  const onEditRole = React.useCallback(
    async ({ id, clusterId }: Host, role: HostUpdateParams['hostRole']) => {
      try {
        if (!clusterId) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(`Failed to edit role in host: ${id}.\nMissing cluster_id`);
        }
        const { data } = await HostsService.updateRole(clusterId, id, role);
        resetCluster ? resetCluster() : dispatch(updateHost(data));
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to set role', message: getErrorMessage(e) }),
        );
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
  const onMassChangeHostname = React.useCallback(
    () => massUpdateHostnameDialog.open({ hostIDs: selectedHostIDs, cluster }),
    [selectedHostIDs, cluster, massUpdateHostnameDialog],
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
    onSelect,
    selectedHostIDs,
    setSelectedHostIDs,
    onMassChangeHostname,
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

export const HostsTableModals: React.FC<HostsTableModalsProps> = ({
  cluster,
  onDelete,
  onReset,
  onAdditionalNtpSource,
  onUpdateDay2ApiVip,
}) => {
  const dispatch = useDispatch();
  const { resetCluster } = React.useContext(AddHostsContext);

  const {
    eventsDialog,
    editHostDialog,
    deleteHostDialog,
    resetHostDialog,
    additionalNTPSourcesDialog,
    UpdateDay2ApiVipDialog,
    massUpdateHostnameDialog,
  } = useModalDialogsContext();
  return (
    <>
      <EventsModal
        title={`Host Events${eventsDialog.isOpen ? `: ${eventsDialog.data?.hostname}` : ''}`}
        entityKind="host"
        cluster={cluster}
        hostId={eventsDialog.data?.hostId}
        onClose={eventsDialog.close}
        isOpen={eventsDialog.isOpen}
        onFetchEvents={onFetchEvents}
      />
      <ResetHostModal
        hostname={resetHostDialog.data?.hostname}
        onClose={resetHostDialog.close}
        isOpen={resetHostDialog.isOpen}
        onReset={onReset}
      />
      <DeleteHostModal
        hostname={deleteHostDialog.data?.hostname}
        onClose={deleteHostDialog.close}
        isOpen={deleteHostDialog.isOpen}
        onDelete={onDelete}
      />
      <EditHostModal
        host={editHostDialog.data?.host}
        inventory={editHostDialog.data?.inventory}
        usedHostnames={
          cluster?.hosts?.map((h: Host) => h.requestedHostname).filter((h) => h) as
            | string[]
            | undefined
        }
        onClose={editHostDialog.close}
        isOpen={editHostDialog.isOpen}
        onSave={async (values: EditHostFormValues) => {
          const { data } = await HostsService.updateHostName(
            cluster.id,
            values.hostId,
            values.hostname,
          );
          resetCluster ? resetCluster() : dispatch(updateHost(data));
          editHostDialog.close();
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onFormSaveError={(e: any) => {
          let message;
          handleApiError(e, () => (message = getErrorMessage(e)));
          return message;
        }}
      />
      <AdditionalNTPSourcesDialog
        additionalNtpSource={cluster.additionalNtpSource}
        isOpen={additionalNTPSourcesDialog.isOpen}
        onClose={additionalNTPSourcesDialog.close}
        onAdditionalNtpSource={onAdditionalNtpSource}
      />
      <UpdateDay2ApiVipModal
        isOpen={UpdateDay2ApiVipDialog.isOpen}
        onClose={UpdateDay2ApiVipDialog.close}
        onUpdateDay2ApiVip={onUpdateDay2ApiVip}
        currentApiVip={cluster.apiVipDnsName}
      />
      <MassChangeHostnameModal
        isOpen={massUpdateHostnameDialog.isOpen}
        onClose={massUpdateHostnameDialog.close}
        hosts={massUpdateHostnameDialog.data?.cluster?.hosts || []}
        selectedHostIDs={massUpdateHostnameDialog.data?.hostIDs || []}
        onChangeHostname={(host, hostname) =>
          HostsService.updateHostName(cluster.id, host.id, hostname)
        }
      />
    </>
  );
};

export const getHostId = (host: Host) => host.id;
