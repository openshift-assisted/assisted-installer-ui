import React from 'react';
import { Host, Inventory } from '../../api/types';
import dialogsReducer, {
  openDialog as openDialogAction,
  closeDialog as closeDialogAction,
} from '../../features/dialogs/dialogsSlice';

type HostIdAndHostname = {
  hostId: Host['id'];
  hostname: string;
};

type EditHostProps = {
  host: Host;
  inventory: Inventory;
};

type DialogsDataTypes = {
  eventsDialog: HostIdAndHostname;
  editHostDialog: EditHostProps;
  deleteHostDialog: HostIdAndHostname;
  resetHostDialog: HostIdAndHostname;
  additionalNTPSourcesDialog: void;
};

type DialogId =
  | 'eventsDialog'
  | 'editHostDialog'
  | 'deleteHostDialog'
  | 'resetHostDialog'
  | 'additionalNTPSourcesDialog';

export type HostDialogsContextType = {
  [key in DialogId]: {
    isOpen: boolean;
    open: (data: DialogsDataTypes[key]) => void;
    close: () => void;
    data?: DialogsDataTypes[key];
  };
};

const dialogIds: DialogId[] = [
  'eventsDialog',
  'editHostDialog',
  'deleteHostDialog',
  'resetHostDialog',
  'additionalNTPSourcesDialog',
];

const HostDialogsContext = React.createContext<HostDialogsContextType | undefined>(undefined);

const HostDialogsContextProvider: React.FC = ({ children }) => {
  const [dialogsState, dispatchDialogsAction] = React.useReducer(dialogsReducer, {});

  function getOpenDialog<DataType>(dialogId: string) {
    return (data: DataType) => dispatchDialogsAction(openDialogAction({ dialogId, data }));
  }

  const getCloseDialog = (dialogId: string) => () =>
    dispatchDialogsAction(closeDialogAction({ dialogId }));

  const context = dialogIds.reduce((context, dialogId) => {
    context[dialogId] = {
      isOpen: !!dialogsState[dialogId],
      open: (data: DialogsDataTypes[typeof dialogId]) =>
        getOpenDialog<DialogsDataTypes[typeof dialogId]>(dialogId)(data),
      close: () => getCloseDialog(dialogId)(),
      data: dialogsState[dialogId],
    };
    return context;
  }, {});

  return (
    <HostDialogsContext.Provider value={context as HostDialogsContextType}>
      {children}
    </HostDialogsContext.Provider>
  );
};

const useHostDialogsContext = () => {
  const context = React.useContext(HostDialogsContext);
  if (context === undefined) {
    throw new Error('useHostDialogsContext must be used within a HostDialogsContextProvider');
  }
  return context;
};

export { HostDialogsContextProvider, useHostDialogsContext };
