import React from 'react';
import { onDiskRoleType } from '../../../common/components/hosts/DiskRole';
import { Host } from '../../../common';

type HostTableDetailContext = {
  canEditDisks: (host: Host) => boolean;
  onDiskRole: onDiskRoleType;
};

const HostsTableDetailContext = React.createContext<HostTableDetailContext | undefined>(undefined);

const HostsTableDetailContextProvider: React.FC<HostTableDetailContext> = ({
  canEditDisks,
  onDiskRole,
  children,
}) => {
  const context = {
    canEditDisks,
    onDiskRole,
  };

  return (
    <HostsTableDetailContext.Provider value={context as HostTableDetailContext}>
      {children}
    </HostsTableDetailContext.Provider>
  );
};

const useHostTableDetailContext = () => {
  const context = React.useContext(HostsTableDetailContext);
  if (context === undefined) {
    throw new Error(
      'useHostTableDetailContext must be used within a HostsTableDetailContextProvider',
    );
  }
  return context;
};

export { HostsTableDetailContextProvider, useHostTableDetailContext };
