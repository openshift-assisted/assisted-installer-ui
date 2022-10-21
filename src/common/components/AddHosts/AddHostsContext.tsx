import React from 'react';
import { Cluster } from '../../api';
import { CpuArchitecture } from '../../types';

export type AddHostsContextType = {
  cluster?: Cluster;
  resetCluster?: () => Promise<void>;
  ocpConsoleUrl?: string;
  day1CpuArchitecture?: CpuArchitecture;
};

export const AddHostsContext = React.createContext<AddHostsContextType>({});

export const AddHostsContextProvider: React.FC<AddHostsContextType> = ({
  cluster,
  resetCluster,
  ocpConsoleUrl,
  day1CpuArchitecture,
  children,
}) => (
  <AddHostsContext.Provider value={{ cluster, resetCluster, day1CpuArchitecture, ocpConsoleUrl }}>
    {children}
  </AddHostsContext.Provider>
);
