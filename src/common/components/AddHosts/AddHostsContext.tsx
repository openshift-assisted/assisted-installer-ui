import React from 'react';
import { Cluster } from '../../api';

export type AddHostsContextType = {
  cluster?: Cluster;
  resetCluster?: () => Promise<void>;
  ocpConsoleUrl?: string;
  canEdit?: boolean;
};

export const AddHostsContext = React.createContext<AddHostsContextType>({});

export const AddHostsContextProvider: React.FC<AddHostsContextType> = ({
  cluster,
  resetCluster,
  ocpConsoleUrl,
  canEdit = true,
  children,
}) => (
  <AddHostsContext.Provider value={{ cluster, resetCluster, ocpConsoleUrl, canEdit }}>
    {children}
  </AddHostsContext.Provider>
);
