import React from 'react';
import {
  Cluster,
  getClusterPreflightRequirements,
  getErrorMessage,
  handleApiError,
  PreflightHardwareRequirements,
} from '../../api';
import { addAlert } from '../../features/alerts/alertsSlice';

export type ClusterPreflightRequirementsContextType = {
  preflightRequirements?: PreflightHardwareRequirements;
};

export const ClusterPreflightRequirementsContext = React.createContext<
  ClusterPreflightRequirementsContextType
>({});

export const ClusterPreflightRequirementsContextProvider: React.FC<{
  clusterId: Cluster['id'];
}> = ({ clusterId, children }) => {
  const [preflightRequirements, setPreflightRequirements] = React.useState<
    PreflightHardwareRequirements
  >();

  React.useEffect(() => {
    const fetchFunc = async () => {
      try {
        const { data } = await getClusterPreflightRequirements(clusterId);
        setPreflightRequirements(data);
      } catch (e) {
        handleApiError(e, () =>
          addAlert({
            title: 'Failed to retrieve preflight cluster requirements',
            message: getErrorMessage(e),
          }),
        );
      }
    };
    fetchFunc();
  }, [setPreflightRequirements, clusterId]);

  return (
    <ClusterPreflightRequirementsContext.Provider
      value={{
        preflightRequirements,
      }}
    >
      {children}
    </ClusterPreflightRequirementsContext.Provider>
  );
};

export const useClusterPreflightRequirementsContext = () => {
  const context = React.useContext(ClusterPreflightRequirementsContext);
  if (context === undefined) {
    throw new Error(
      'useClusterPreflightRequirementsContext must be used within a ClusterPreflightRequirementsContextProvider',
    );
  }
  return context;
};
