import React from 'react';
import { isInSubnet } from 'is-in-subnet';
import {
  InfraEnv,
  InfraEnvUpdateParams,
} from '@openshift-assisted/types/assisted-installer-service';
import { InfraEnvsAPI } from '../../../../../common';
import { useClusterWizardContext } from '../../clusterWizardContext';
import { ClusterWizardStepsType } from '../../utils';
import { StaticIp } from '../staticIp/StaticIp';
import {
  canonicalizeIp,
  getFormData,
  getHostIpsFromInfraEnv,
  getMachineNetworkCidr,
  getShownProtocolVersions,
} from '../staticIp/data';

const getRendezvousIpCrossStepError = (
  stepId: ClusterWizardStepsType,
  infraEnv: InfraEnv,
): string | undefined => {
  const rendezvousIp = infraEnv.rendezvousIp?.trim();
  if (!rendezvousIp) {
    return undefined;
  }

  if (stepId === 'static-ip-network-wide-configurations') {
    try {
      const { networkWide } = getFormData(infraEnv);
      const cidrs: string[] = [];
      for (const protocolVersion of getShownProtocolVersions(networkWide.protocolType)) {
        const machineNetwork = networkWide.ipConfigs[protocolVersion].machineNetwork;
        if (machineNetwork.ip && machineNetwork.prefixLength) {
          cidrs.push(getMachineNetworkCidr(machineNetwork));
        }
      }
      if (cidrs.length === 0) {
        return undefined;
      }
      const inAnySubnet = cidrs.some((cidr) => {
        try {
          return isInSubnet(rendezvousIp, cidr);
        } catch {
          return false;
        }
      });
      if (!inAnySubnet) {
        return 'The rendezvous IP is outside the machine network subnet';
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  if (stepId === 'static-ip-host-configurations' || stepId === 'static-ip-yaml-view') {
    const staticHostIps = getHostIpsFromInfraEnv(infraEnv);
    if (staticHostIps.length === 0) {
      return undefined;
    }
    const canonicalValue = canonicalizeIp(rendezvousIp);
    if (!staticHostIps.some((ip) => canonicalizeIp(ip) === canonicalValue)) {
      return 'The rendezvous IP must match one of the defined static IPs';
    }
  }

  return undefined;
};

export const DisconnectedStaticIp: React.FC = () => {
  const { currentStepId, disconnectedInfraEnv, setDisconnectedInfraEnv } =
    useClusterWizardContext();

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

  const crossStepError = React.useMemo(() => {
    if (!disconnectedInfraEnv) {
      return undefined;
    }
    return getRendezvousIpCrossStepError(currentStepId, disconnectedInfraEnv);
  }, [currentStepId, disconnectedInfraEnv]);

  if (!disconnectedInfraEnv) {
    return null;
  }

  return (
    <StaticIp
      infraEnv={disconnectedInfraEnv}
      updateInfraEnv={updateInfraEnv}
      crossStepError={crossStepError}
    />
  );
};

export default DisconnectedStaticIp;
