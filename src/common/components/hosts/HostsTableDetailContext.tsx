import React from 'react';
import { onDiskRoleType } from './DiskRole';
import { HostsTableActions } from './types';

type HostsTableDetailContextValue = {
  onDiskRole: onDiskRoleType | undefined;
  canEditDisks: HostsTableActions['canEditDisks'];
};

const HostsTableDetailContext = React.createContext<HostsTableDetailContextValue | undefined>(
  undefined,
);

const HostsTableDetailContextProvider: React.FC<HostsTableDetailContextValue> = ({
  canEditDisks,
  onDiskRole,
  children,
}) => {
  const context = {
    canEditDisks,
    onDiskRole,
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
