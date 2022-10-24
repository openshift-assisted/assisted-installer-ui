import React from 'react';
import { Cluster } from '../../api';

export type AddHostsContextType = {
  cluster?: Cluster;
  resetCluster?: () => Promise<void>;
  ocpConsoleUrl?: string;
};

export const AddHostsContext = React.createContext<AddHostsContextType>({});

export const AddHostsContextProvider: React.FC<AddHostsContextType> = ({
  cluster,
  resetCluster,
  ocpConsoleUrl,
  children,
}) => (
  <AddHostsContext.Provider value={{ cluster, resetCluster, ocpConsoleUrl }}>
    {children}
  </AddHostsContext.Provider>
);
