import React from 'react';
import { AgentClusterInstallK8sResource } from '../../types';

type ClusterDeploymentWizardContextType = {
  syncError?: string;
};

export const ClusterDeploymentWizardContext =
  React.createContext<ClusterDeploymentWizardContextType>({
    syncError: undefined,
  });

export const ClusterDeploymentWizardContextProvider = ({
  children,
  agentClusterInstall,
}: {
  children: React.ReactNode;
  agentClusterInstall?: AgentClusterInstallK8sResource;
}) => {
  const syncError = React.useMemo(
    () =>
      agentClusterInstall?.status?.conditions?.find(
        (c) => c.type === 'SpecSynced' && c.status === 'False',
      )?.message,
    [agentClusterInstall?.status?.conditions],
  );

  return (
    <ClusterDeploymentWizardContext.Provider value={{ syncError }}>
      {children}
    </ClusterDeploymentWizardContext.Provider>
  );
};
