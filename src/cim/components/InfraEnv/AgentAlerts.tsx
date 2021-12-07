import { Alert, AlertVariant } from '@patternfly/react-core';
import * as React from 'react';
import { INFRAENV_AGENTINSTALL_LABEL_KEY, getInfraEnvDocs } from '../common/constants';
import { BareMetalHostK8sResource, InfraEnvK8sResource } from '../../types';

type AgentAlertsProps = {
  docVersion: string;
  infraEnv: InfraEnvK8sResource;
  bareMetalHosts: BareMetalHostK8sResource[];
};

const AgentAlerts: React.FC<AgentAlertsProps> = ({ infraEnv, bareMetalHosts, docVersion }) => {
  const infraBMHs =
    infraEnv &&
    bareMetalHosts?.filter(
      (h) =>
        h.metadata?.namespace === infraEnv.metadata?.namespace &&
        h.metadata?.labels?.[INFRAENV_AGENTINSTALL_LABEL_KEY] === infraEnv.metadata?.name,
    );

  return infraBMHs?.some((bmh) => !bmh.status) ? (
    <Alert
      title="Metal3 operator is not configured"
      variant={AlertVariant.warning}
      isInline
      className="cim-resource-alerts"
      actionLinks={
        <a href={getInfraEnvDocs(docVersion)} target="_blank" rel="noopener noreferrer">
          Open documentation
        </a>
      }
    >
      It seems the Metal3 operator is missing configuration which will prevent it to find bare metal
      hosts in this namespace. Please refer to the documentation for the first time setup steps.
    </Alert>
  ) : null;
};

export default AgentAlerts;
