import React from 'react';
import { InfraEnvUpdateParams } from '@openshift-assisted/types/assisted-installer-service';
import { InfraEnvsAPI } from '../../../../../common';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { StaticIp } from '../staticIp/StaticIp';

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
