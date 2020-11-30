import React from 'react';
import { Cluster } from '../../api';

export type AddBareMetalHostsContextType = {
  cluster?: Cluster;
  ocpConsoleUrl?: string;
};

export const AddBareMetalHostsContext = React.createContext<AddBareMetalHostsContextType>({});

export const AddBareMetalHostsContextProvider: React.FC<AddBareMetalHostsContextType> = ({
  cluster,
  ocpConsoleUrl,
  children,
}) => (
  <AddBareMetalHostsContext.Provider value={{ cluster, ocpConsoleUrl }}>
    {children}
  </AddBareMetalHostsContext.Provider>
);
