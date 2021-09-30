import * as React from 'react';
import { useDispatch } from 'react-redux';
import {
  AlertsContext,
  Cluster,
  ClusterUpdateParams,
  Disk,
  DiskConfigParams,
  DiskRole,
  EventsModal,
  Host,
  HostRoleUpdateParams,
  HostUpdateParams,
  Inventory,
  stringToJSON,
} from '../../../common';
import {
  AdditionalNTPSourcesDialog,
  AdditionalNTPSourcesFormProps,
} from '../../../common/components/hosts/AdditionalNTPSourcesDialog';
import {
  deleteHost as ApiDeleteHost,
  getErrorMessage,
  handleApiError,
  installHost,
  patchCluster,
  patchInfraHost,
  resetClusterHost,
  bindHost,
  unbindHost,
} from '../../api';
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
  canDownloadHostLogs,
  canReset as canResetUtil,
  EditHostModal,
} from '../../../common/components/hosts';
import { hostActionResolver } from '../../../common/components/hosts/tableUtils';
import ResetHostModal from './ResetHostModal';
import DeleteHostModal from './DeleteHostModal';
import { onFetchEvents } from '../fetching/fetchEvents';
import { ConnectedIcon } from '@patternfly/react-icons';
import LocalStorageBackedCache from '../../adapters/LocalStorageBackedCache';

export const useHostsTable = (cluster: Cluster) => {
  const infraEnvId = LocalStorageBackedCache.getItem(cluster.id) || '';

  const { addAlert } = React.useContext(AlertsContext);
  const {
    eventsDialog,
    editHostDialog,
    deleteHostDialog,
    resetHostDialog,
  } = useModalDialogsContext();
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
      onHostEnable: async (host: Host) => {
        const hostId = host.id;
        try {
          const { data } = await bindHost(infraEnvId, hostId);
          dispatch(updateHost(data));
        } catch (e) {
          handleApiError(e, () =>
            addAlert({ title: `Failed to enable host ${hostId}`, message: getErrorMessage(e) }),
          );
        }
      },
      onInstallHost: async (host: Host) => {
        const hostId = host.id;
        try {
          //TODO(jgyselov)
          const { data } = await installHost(cluster.id, hostId);
          dispatch(updateHost(data));
        } catch (e) {
          handleApiError(e, () =>
            addAlert({ title: `Failed to enable host ${hostId}`, message: getErrorMessage(e) }),
          );
        }
      },
      onHostDisable: async (host: Host) => {
        const hostId = host.id;
        try {
          const { data } = await unbindHost(infraEnvId, hostId);
          dispatch(updateHost(data));
        } catch (e) {
          handleApiError(e, () =>
            addAlert({ title: `Failed to disable host ${hostId}`, message: getErrorMessage(e) }),
          );
        }
      },
    }),
    [infraEnvId, cluster.id, dispatch, addAlert, deleteHostDialog],
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
      const params: ClusterUpdateParams = {};
      params.disksSelectedConfig = [
        { id: hostId, disksConfig: [{ id: diskId, role } as DiskConfigParams] },
      ];

      try {
        const { data } = await patchCluster(cluster.id, params);
        dispatch(updateCluster(data));
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to set disk role', message: getErrorMessage(e) }),
        );
      }
    },
    [dispatch, addAlert, cluster.id],
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
    }),
    [cluster],
  );

  const onReset = React.useCallback(() => {
    const reset = async (hostId: string | undefined) => {
      if (hostId) {
        try {
          const { data } = await resetClusterHost(cluster.id, hostId);
          dispatch(updateHost(data));
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
  }, [addAlert, cluster.id, dispatch, resetHostDialog]);

  const onDelete = React.useCallback(() => {
    const deleteHost = async (hostId: string | undefined) => {
      if (hostId) {
        try {
          await ApiDeleteHost(infraEnvId, hostId);
          dispatch(forceReload());
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
  }, [addAlert, infraEnvId, dispatch, deleteHostDialog]);

  const onEditRole = React.useCallback(
    async (host: Host, role?: string) => {
      const params: HostUpdateParams = {
        hostRole: role as HostRoleUpdateParams,
      };
      try {
        const { data } = await patchInfraHost(infraEnvId, host.id, params);
        dispatch(updateHost(data));
      } catch (e) {
        handleApiError(e, () =>
          addAlert({ title: 'Failed to set role', message: getErrorMessage(e) }),
        );
      }
    },
    [addAlert, dispatch, infraEnvId],
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

  return {
    onEditHost,
    actionChecks,
    onEditRole,
    actionResolver,
    onReset,
    onDelete,
    onAdditionalNtpSource,
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
};

export const HostsTableModals: React.FC<HostsTableModalsProps> = ({
  cluster,
  onDelete,
  onReset,
  onAdditionalNtpSource,
}) => {
  const infraEnvId = LocalStorageBackedCache.getItem(cluster.id) || '';
  const dispatch = useDispatch();
  const {
    eventsDialog,
    editHostDialog,
    deleteHostDialog,
    resetHostDialog,
    additionalNTPSourcesDialog,
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
        onSave={async (params: HostUpdateParams) => {
          const { data } = await patchInfraHost(infraEnvId, editHostDialog.data.host.id, params);
          dispatch(updateHost(data));
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
        cluster={cluster}
        isOpen={additionalNTPSourcesDialog.isOpen}
        onClose={additionalNTPSourcesDialog.close}
        onAdditionalNtpSource={onAdditionalNtpSource}
      />
    </>
  );
};

export const getHostId = (host: Host) => host.id;
