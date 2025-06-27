import * as React from 'react';
import { Card, CardBody, PageSection, Stack, StackItem } from '@patternfly/react-core';
import AgentAlerts from '../AgentAlerts';
import { InfoAndTroubleshootingNotification } from '../../common';
import InfraEnvAgentTable from '../InfraEnvAgentTable';
import {
  AgentClusterInstallK8sResource,
  AgentK8sResource,
  BareMetalHostK8sResource,
  InfraEnvK8sResource,
  NMStateK8sResource,
} from '../../../types';
import { DOC_VERSION } from '../../../config/constants';
import { ErrorState, LoadingState } from '../../../../common';
import { useNMStates } from '../../../hooks/useNMStates';
import { AgentMachineK8sResource } from '../../Hypershift';
import { useParams } from 'react-router-dom-v5-compat';
import { useAgentMachines } from '../../../hooks/useAgentMachines';
import { useAgentClusterInstalls } from '../../../hooks/useAgentClusterInstall';

const useAgentTabResources = (
  infraEnv: InfraEnvK8sResource,
): [
  NMStateK8sResource[],
  AgentMachineK8sResource[],
  AgentClusterInstallK8sResource[],
  boolean,
  unknown,
] => {
  const { ns } = useParams() as { name: string; ns: string };

  const [nmStates, nmLoaded, nmError] = useNMStates(infraEnv);
  const [agentMachines, amLoaded, amError] = useAgentMachines({ namespace: ns });
  const [agentClusterInstalls, aciLoaded, aciError] = useAgentClusterInstalls({
    namespace: ns,
  });

  return [
    nmStates,
    agentMachines,
    agentClusterInstalls,
    nmLoaded && amLoaded && aciLoaded,
    nmError || amError || aciError,
  ];
};

const AgentsTab = ({
  infraEnv,
  infraAgents,
  infraBMHs,
}: {
  infraEnv: InfraEnvK8sResource;
  infraAgents: AgentK8sResource[];
  infraBMHs: BareMetalHostK8sResource[];
}) => {
  const [nmStates, agentMachines, agentClusterInstalls, loaded, error] =
    useAgentTabResources(infraEnv);

  if (!loaded) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <AgentsTabContent
      infraEnv={infraEnv}
      infraEnvAgents={infraAgents}
      bareMetalHosts={infraBMHs}
      nmStates={nmStates}
      agentMachines={agentMachines}
      agentClusterInstalls={agentClusterInstalls}
    />
  );
};

const AgentsTabContent = ({
  infraEnv,
  infraEnvAgents,
  bareMetalHosts,
  nmStates,
  agentMachines,
  agentClusterInstalls,
}: {
  infraEnv: InfraEnvK8sResource;
  infraEnvAgents: AgentK8sResource[];
  bareMetalHosts: BareMetalHostK8sResource[];
  nmStates: NMStateK8sResource[];
  agentMachines: AgentMachineK8sResource[];
  agentClusterInstalls: AgentClusterInstallK8sResource[];
}) => {
  return (
    <PageSection>
      <Stack hasGutter>
        <StackItem>
          <Card isPlain>
            <AgentAlerts
              infraEnv={infraEnv}
              bareMetalHosts={bareMetalHosts}
              docVersion={DOC_VERSION}
            />
            <InfoAndTroubleshootingNotification />
          </Card>
        </StackItem>
        <StackItem>
          <Card>
            <CardBody>
              <InfraEnvAgentTable
                agents={infraEnvAgents}
                agentMachines={agentMachines}
                agentClusterInstalls={agentClusterInstalls}
                bareMetalHosts={bareMetalHosts}
                infraEnv={infraEnv}
                nmStates={nmStates}
              />
            </CardBody>
          </Card>
        </StackItem>
      </Stack>
    </PageSection>
  );
};

export default AgentsTab;
