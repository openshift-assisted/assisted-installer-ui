import React from 'react';
import { InfraEnvUpdateParams } from '@openshift-assisted/types/assisted-installer-service';
import { useClusterWizardContext } from '../ClusterWizardContext';
import { InfraEnvsAPI } from '../../../services/apis';
import StaticIp from '../StaticIp';

export const DisconnectedStaticIp: React.FC = () => {
  const { disconnectedInfraEnv, setDisconnectedInfraEnv } = useClusterWizardContext();

  const updateInfraEnv = React.useCallback(
    async (params: InfraEnvUpdateParams) => {
      if (!disconnectedInfraEnv?.id) {
        throw new Error('No disconnected infraEnv available');
      }
      const { data: updatedInfraEnv } = await InfraEnvsAPI.update(disconnectedInfraEnv.id, params);
      setDisconnectedInfraEnv(updatedInfraEnv);
      return updatedInfraEnv;
    },
    [disconnectedInfraEnv, setDisconnectedInfraEnv],
  );

  if (!disconnectedInfraEnv) {
    return null;
  }

  return <StaticIp infraEnv={disconnectedInfraEnv} updateInfraEnv={updateInfraEnv} />;
};

export default DisconnectedStaticIp;
