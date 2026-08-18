import React from 'react';
import { Disk, DiskRole, Host } from '@openshift-assisted/types/assisted-installer-service';
import { HostsTableActions } from './types';

export type OnDiskRoleType = (
  hostId: Host['id'],
  diskId: Disk['id'],
  role: DiskRole,
) => Promise<unknown>;

type HostsTableDetailContextValue = {
  onDiskRole: OnDiskRoleType | undefined;
  canEditDisks: HostsTableActions['canEditDisks'];
  updateDiskSkipFormatting?: HostsTableActions['updateSkipFormatting'];
};

const HostsTableDetailContext = React.createContext<HostsTableDetailContextValue | undefined>(
  undefined,
);

export const HostsTableDetailContextProvider: React.FC<
  React.PropsWithChildren<HostsTableDetailContextValue>
> = ({ canEditDisks, onDiskRole, updateDiskSkipFormatting, children }) => {
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

export const useHostsTableDetailContext = () => {
  const context = React.useContext(HostsTableDetailContext);
  if (context === undefined) {
    throw new Error(
      'useHostTableDetailContext must be used within a HostsTableDetailContextProvider',
    );
  }
  return context;
};
