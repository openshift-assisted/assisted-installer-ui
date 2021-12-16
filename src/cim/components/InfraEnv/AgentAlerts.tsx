import { Alert, AlertVariant } from '@patternfly/react-core';
import * as React from 'react';
import { getInfraEnvDocs } from '../common/constants';
import { getInfraEnvNameOfAgent } from '../helpers';
import { BareMetalHostK8sResource, InfraEnvK8sResource, ConfigMapK8sResource } from '../../types';
import { HostRequirementsList } from '../../../common/components';
import { getHWRequirements } from '../Agent/MinimalHWRequirements';

type AgentAlertsProps = {
  docVersion: string;
  infraEnv: InfraEnvK8sResource;
  bareMetalHosts: BareMetalHostK8sResource[];
  aiConfigMap: ConfigMapK8sResource;
};

const AgentAlerts: React.FC<AgentAlertsProps> = ({
  infraEnv,
  bareMetalHosts,
  docVersion,
  aiConfigMap,
}) => {
  const infraBMHs =
    infraEnv &&
    bareMetalHosts?.filter(
      (h) =>
        h.metadata?.namespace === infraEnv.metadata?.namespace &&
        getInfraEnvNameOfAgent(h) === infraEnv.metadata?.name,
    );

  return (
    <>
      {infraBMHs?.some((bmh) => !bmh.status) && (
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
          It seems the Metal3 operator is missing configuration which will prevent it to find bare
          metal hosts in this namespace. Please refer to the documentation for the first time setup
          steps.
        </Alert>
      )}
      {aiConfigMap && (
        <Alert
          title="Minimum hardware requirements"
          variant={AlertVariant.info}
          isInline
          isExpandable
          className="cim-resource-alerts"
        >
          <HostRequirementsList {...getHWRequirements(aiConfigMap)} />
        </Alert>
      )}
    </>
  );
};

export default AgentAlerts;
