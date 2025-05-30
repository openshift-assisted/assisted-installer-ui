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
import { useK8sWatchResource } from '../../../hooks/useK8sWatchResource';
import { useInfraEnvNMStates } from '../../../hooks/useInfraEnvNMStates';
import { AgentMachineK8sResource } from '../../Hypershift';
import { AgentClusterInstallModel, AgentMachineModel } from '../../../types/models';
import { useParams } from 'react-router-dom-v5-compat';

const AgentsTab = ({
  infraEnv,
  infraAgents,
  infraBMHs,
}: {
  infraEnv: InfraEnvK8sResource;
  infraAgents: AgentK8sResource[];
  infraBMHs: BareMetalHostK8sResource[];
}) => {
  const { ns } = useParams() as { name: string; ns: string };

  const [nmStates, nmLoaded, nmError] = useInfraEnvNMStates(infraEnv);

  const [agentMachines, amLoaded, amError] = useK8sWatchResource<AgentMachineK8sResource[]>({
    groupVersionKind: {
      kind: AgentMachineModel.kind,
      version: AgentMachineModel.apiVersion,
      group: AgentMachineModel.apiGroup,
    },
    namespace: ns,
    isList: true,
  });

  const [agentClusterInstalls, aciLoaded, aciError] = useK8sWatchResource<
    AgentClusterInstallK8sResource[]
  >({
    groupVersionKind: {
      kind: AgentClusterInstallModel.kind,
      version: AgentClusterInstallModel.apiVersion,
      group: AgentClusterInstallModel.apiGroup,
    },
    namespace: ns,
    isList: true,
  });

  if (!nmLoaded || !amLoaded || !aciLoaded) {
    return <LoadingState />;
  }

  if (nmError || amError || aciError) {
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
