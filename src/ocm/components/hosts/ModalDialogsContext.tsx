import React from 'react';
import { Host, Inventory, Cluster } from '../../../common';
import { dialogsSlice } from '../../../common';

const { openDialog: openDialogAction, closeDialog: closeDialogAction } = dialogsSlice.actions;
const dialogsReducer = dialogsSlice.reducer;

type HostIdAndHostname = {
  hostId: Host['id'];
  hostname: string;
};

type EditHostProps = {
  host: Host;
  inventory: Inventory;
};

type ResetClusterProps = {
  cluster: Cluster;
};

type CancelInstallationProps = {
  clusterId: Cluster['id'];
};

type DiscoveryImageDialogProps = {
  cluster: Cluster;
};

type MassUpdateHostnameDialogProps = {
  cluster: Cluster;
  hostIDs: string[];
};

type ModalDialogsDataTypes = {
  eventsDialog: HostIdAndHostname;
  editHostDialog: EditHostProps;
  deleteHostDialog: HostIdAndHostname;
  resetHostDialog: HostIdAndHostname;
  additionalNTPSourcesDialog: void;
  resetClusterDialog: ResetClusterProps;
  cancelInstallationDialog: CancelInstallationProps;
  discoveryImageDialog: DiscoveryImageDialogProps;
  UpdateDay2ApiVipDialog: void;
  massUpdateHostnameDialog: MassUpdateHostnameDialogProps;
};

type DialogId =
  | 'eventsDialog'
  | 'editHostDialog'
  | 'deleteHostDialog'
  | 'resetHostDialog'
  | 'additionalNTPSourcesDialog'
  | 'resetClusterDialog'
  | 'cancelInstallationDialog'
  | 'discoveryImageDialog'
  | 'UpdateDay2ApiVipDialog'
  | 'massUpdateHostnameDialog';

export type ModalDialogsContextType = {
  [key in DialogId]: {
    isOpen: boolean;
    open: (data: ModalDialogsDataTypes[key]) => void;
    close: () => void;
    data: ModalDialogsDataTypes[key];
  };
};

const dialogIds: DialogId[] = [
  'eventsDialog',
  'editHostDialog',
  'deleteHostDialog',
  'resetHostDialog',
  'additionalNTPSourcesDialog',
  'resetClusterDialog',
  'cancelInstallationDialog',
  'discoveryImageDialog',
  'UpdateDay2ApiVipDialog',
  'massUpdateHostnameDialog',
];

const ModalDialogsContext = React.createContext<ModalDialogsContextType | undefined>(undefined);

const ModalDialogsContextProvider: React.FC = ({ children }) => {
  const [dialogsState, dispatchDialogsAction] = React.useReducer(dialogsReducer, {});

  function getOpenDialog<DataType>(dialogId: string) {
    return (data: DataType) => dispatchDialogsAction(openDialogAction({ dialogId, data }));
  }

  const getCloseDialog = (dialogId: string) => () =>
    dispatchDialogsAction(closeDialogAction({ dialogId }));

  const context = dialogIds.reduce((context, dialogId) => {
    context[dialogId] = {
      isOpen: !!dialogsState[dialogId],
      open: (data: ModalDialogsDataTypes[typeof dialogId]) =>
        getOpenDialog<ModalDialogsDataTypes[typeof dialogId]>(dialogId)(data),
      close: () => getCloseDialog(dialogId)(),
      data: dialogsState[dialogId],
    };
    return context;
  }, {});

  return (
    <ModalDialogsContext.Provider value={context as ModalDialogsContextType}>
      {children}
    </ModalDialogsContext.Provider>
  );
};

const useModalDialogsContext = () => {
  const context = React.useContext(ModalDialogsContext);
  if (context === undefined) {
    throw new Error('useModalDialogsContext must be used within a ModalDialogsContextProvider');
  }
  return context;
};

export { ModalDialogsContextProvider, useModalDialogsContext };
