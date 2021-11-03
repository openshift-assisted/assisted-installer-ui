import React from 'react';
import { useFormikContext } from 'formik';
import { Grid, GridItem, TextContent, Text, Button, ButtonVariant } from '@patternfly/react-core';
import {
  DiscoveryInstructions,
  DiscoveryTroubleshootingModal,
  FormatDiskWarning,
  HostsNotShowingLink,
  VMRebootConfigurationInfo,
} from '../../../common';
import { getIsSNOCluster } from '../helpers';
import MinimalHWRequirements from '../Agent/MinimalHWRequirements';
import {
  ClusterDeploymentHostsDiscoveryProps,
  ClusterDeploymentHostsDiscoveryValues,
} from './types';
// import {
//   cpuCoresColumn,
//   disksColumn,
//   hostnameColumn,
//   memoryColumn,
// } from '../../../common/components/hosts/tableUtils';
// import { useAgentsTable } from '../Agent/tableUtils';
import { InfraEnvAgentTable } from '../InfraEnv';
// import EmptyState from '../../../common/components/ui/uiState/EmptyState';
import { AddHostModal, EditBMHModal, EditAgentModal } from '../modals';
import { AgentK8sResource, BareMetalHostK8sResource } from '../../types';

const ClusterDeploymentHostsDiscovery: React.FC<ClusterDeploymentHostsDiscoveryProps> = ({
  // clusterDeployment,
  agentClusterInstall,
  agents,
  bareMetalHosts,
  aiConfigMap,
  infraEnv,
  usedHostnames,
  onValuesChanged,
  onCreateBMH,
  onApproveAgent,
  onDeleteHost,
  canDeleteAgent,
  onSaveAgent,
  onSaveBMH,
  onFormSaveError,
  fetchSecret,
  fetchNMState,
  isBMPlatform,
  getClusterDeploymentLink,
}) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const { values } = useFormikContext<ClusterDeploymentHostsDiscoveryValues>();
  const [isoModalOpen, setISOModalOpen] = React.useState(false);
  const [editBMH, setEditBMH] = React.useState<BareMetalHostK8sResource>();
  const [editAgent, setEditAgent] = React.useState<AgentK8sResource | undefined>();

  const isVM = true; // TODO(mlibra): calculate from agent's inventory

  React.useEffect(() => onValuesChanged?.(values), [values, onValuesChanged]);

  const isSNOCluster = getIsSNOCluster(agentClusterInstall);

  console.log('--- ClusterDeploymentHostsDiscovery agents: ', agents);

  /*  const [hosts, actions, actionResolver] = useAgentsTable({}, { agents });
  const content = [
    hostnameColumn(),
    // infraEnvColumn(agents),
    // TODO(mlibra): use Discovered At?
    cpuCoresColumn,
    memoryColumn,
    disksColumn,
  ];
*/
  return (
    <Grid hasGutter>
      <GridItem>
        <TextContent>
          <DiscoveryInstructions isSingleNodeCluster={isSNOCluster} />
        </TextContent>
      </GridItem>
      <GridItem>
        <Button variant={ButtonVariant.primary} onClick={() => setISOModalOpen(true)}>
          Add host
        </Button>
      </GridItem>
      <GridItem>TODO: CNV, SNO checkboxes</GridItem>

      <GridItem>
        <TextContent>
          <Text component="h3">Information and warnings</Text>
          <Text component="p">
            {aiConfigMap && (
              <MinimalHWRequirements aiConfigMap={aiConfigMap} isSNOCluster={isSNOCluster} />
            )}
            <HostsNotShowingLink setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
          </Text>
          {isVM && <VMRebootConfigurationInfo />}
          {/* <OCSDisksManualFormattingHint /> Recently not used in the ACM flow */}
          <FormatDiskWarning />
        </TextContent>
      </GridItem>

      <GridItem>
        <InfraEnvAgentTable
          agents={agents}
          bareMetalHosts={bareMetalHosts}
          infraEnv={infraEnv}
          getClusterDeploymentLink={getClusterDeploymentLink}
          onEditHost={setEditAgent}
          onApprove={onApproveAgent}
          canDelete={canDeleteAgent}
          onDeleteHost={onDeleteHost}
          onEditBMH={setEditBMH}
        />
        <EditBMHModal
          infraEnv={infraEnv}
          bmh={editBMH}
          isOpen={!!editBMH}
          onClose={() => setEditBMH(undefined)}
          onEdit={onSaveBMH}
          fetchSecret={fetchSecret}
          fetchNMState={fetchNMState}
        />
        <EditAgentModal
          isOpen={!!editAgent}
          onClose={() => setEditAgent(undefined)}
          usedHostnames={usedHostnames}
          onFormSaveError={onFormSaveError}
          agent={editAgent}
          onSave={onSaveAgent}
        />
        {/*
        <HostsTable
          hosts={hosts}
          content={content}
          actionResolver={actionResolver}
          className="agents-table"
          {...actions}
        >
          <EmptyState title="No hosts found" content="No host matches provided labels/locations" />
        </HostsTable>
        */}
      </GridItem>
      <DiscoveryTroubleshootingModal
        isOpen={isDiscoveryHintModalOpen}
        setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
      />
      <AddHostModal
        infraEnv={infraEnv}
        isOpen={isoModalOpen}
        isBMPlatform={isBMPlatform}
        onClose={() => setISOModalOpen(false)}
        onCreate={onCreateBMH}
      />
    </Grid>
  );
};

export default ClusterDeploymentHostsDiscovery;
