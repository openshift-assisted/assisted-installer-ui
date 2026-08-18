import React from 'react';
import { Cluster, Host } from '@openshift-assisted/types/./assisted-installer-service';
import { useDispatch, useSelector } from 'react-redux';
import {
  AddHostsContext,
  hostnameColumn,
  usePagination,
  ResourceUIState,
  EventsModal,
  EditHostModal,
  EditHostFormValues,
  isUnknownServerError,
  handleApiError,
  getApiErrorMessage,
  AdditionalNTPSourcesDialog,
  MassChangeHostnameModal,
  MassDeleteHostModal,
  HostsTable,
  useTranslation,
} from '../../../../common';
import { ClustersService, HostsService } from '../../../services';
import { selectCurrentClusterState, updateHost, setServerUpdateError } from '../../../store';
import { onFetchEvents } from '../../fetching';
import { ClusterWizardContext } from '../../wizard/clusterWizardContext';
import { hardwareStatusColumn } from '../HardwareStatus';
import { useModalDialogsContext } from './ModalDialogsContext';
import { UpdateDay2ApiVipModal, UpdateDay2ApiVipModalProps } from './UpdateDay2ApiVipModal';
import { ResetHostModal } from './ResetHostModal';
import { DeleteHostModal } from './DeleteHostModal';

type HostsTableModalsProps = {
  cluster: Cluster;
  onReset: VoidFunction;
  onDelete: VoidFunction;
  onAdditionalNtpSource: (
    additionalNtpSource: string,
    onError: (message: string) => void,
  ) => Promise<void>;
  onUpdateDay2ApiVip: UpdateDay2ApiVipModalProps['onUpdateDay2ApiVip'];
};

export const HostsTableModals = ({
  cluster,
  onDelete,
  onReset,
  onAdditionalNtpSource,
  onUpdateDay2ApiVip,
}: HostsTableModalsProps) => {
  const { wizardPerPage, setWizardPerPage } = React.useContext(ClusterWizardContext) || {};
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
  const paginationProps = usePagination(
    massDeleteHostDialog.data?.hosts?.length || 0,
    wizardPerPage,
    setWizardPerPage,
  );

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
            handleApiError(e);
            return getApiErrorMessage(e);
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
