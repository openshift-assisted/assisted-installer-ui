import React from 'react';
import { OnDiskRoleType } from './DiskRole';
import { HostsTableActions } from './types';

type HostsTableDetailContextValue = {
  onDiskRole: OnDiskRoleType | undefined;
  canEditDisks: HostsTableActions['canEditDisks'];
  updateDiskSkipFormatting?: HostsTableActions['updateSkipFormatting'];
};

const HostsTableDetailContext = React.createContext<HostsTableDetailContextValue | undefined>(
  undefined,
);

const HostsTableDetailContextProvider: React.FC<HostsTableDetailContextValue> = ({
  canEditDisks,
  onDiskRole,
  updateDiskSkipFormatting,
  children,
}) => {
  const context = {
    canEditDisks,
    onDiskRole,
    updateDiskSkipFormatting,
  };

  return (
    <HostsTableDetailContext.Provider value={context as HostsTableDetailContextValue}>
      {children}
    </HostsTableDetailContext.Provider>
  );
};

const useHostsTableDetailContext = () => {
  const context = React.useContext(HostsTableDetailContext);
  if (context === undefined) {
    throw new Error(
      'useHostTableDetailContext must be used within a HostsTableDetailContextProvider',
    );
  }
  return context;
};

export { HostsTableDetailContextProvider, useHostsTableDetailContext };
