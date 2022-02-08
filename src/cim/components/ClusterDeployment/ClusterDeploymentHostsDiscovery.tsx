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
import { InfraEnvAgentTable } from '../InfraEnv';
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
  onDeleteHost,
  canDeleteAgent,
  onSaveAgent,
  canEditHost,
  onSaveBMH,
  onSaveISOParams,
  onFormSaveError,
  fetchSecret,
  fetchNMState,
  getClusterDeploymentLink,
  onChangeBMHHostname,
}) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const { values } = useFormikContext<ClusterDeploymentHostsDiscoveryValues>();
  const [isoModalOpen, setISOModalOpen] = React.useState(false);
  const [editBMH, setEditBMH] = React.useState<BareMetalHostK8sResource>();
  const [editAgent, setEditAgent] = React.useState<AgentK8sResource | undefined>();

  const isVM = true; // TODO(mlibra): calculate from agent's inventory

  React.useEffect(() => onValuesChanged?.(values), [values, onValuesChanged]);

  const isSNOCluster = getIsSNOCluster(agentClusterInstall);

  return (
    <Grid hasGutter>
      <GridItem>
        <TextContent>
          <DiscoveryInstructions showAllInstructions />
        </TextContent>
      </GridItem>
      {!!onCreateBMH && (
        <GridItem>
          <Button variant={ButtonVariant.primary} onClick={() => setISOModalOpen(true)}>
            Add host
          </Button>
        </GridItem>
      )}

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
          hideClusterColumn={true}
          agents={agents}
          bareMetalHosts={bareMetalHosts}
          infraEnv={infraEnv}
          getClusterDeploymentLink={getClusterDeploymentLink}
          onEditHost={setEditAgent}
          canEditHost={canEditHost}
          canDelete={canDeleteAgent}
          onDeleteHost={onDeleteHost}
          onEditBMH={setEditBMH}
          onChangeHostname={onSaveAgent}
          onChangeBMHHostname={onChangeBMHHostname}
        />
        <EditBMHModal
          infraEnv={infraEnv}
          bmh={editBMH}
          isOpen={!!editBMH}
          onClose={() => setEditBMH(undefined)}
          onEdit={onSaveBMH}
          fetchSecret={fetchSecret}
          fetchNMState={fetchNMState}
          usedHostnames={usedHostnames || []}
        />
        <EditAgentModal
          isOpen={!!editAgent}
          onClose={() => setEditAgent(undefined)}
          usedHostnames={usedHostnames}
          onFormSaveError={onFormSaveError}
          agent={editAgent}
          onSave={onSaveAgent}
        />
      </GridItem>
      <DiscoveryTroubleshootingModal
        isOpen={isDiscoveryHintModalOpen}
        setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
      />
      {!!onCreateBMH &&
      isoModalOpen /* Do not use isOpen props to re-initialize when re-opening */ && (
          <AddHostModal
            infraEnv={infraEnv}
            agentClusterInstall={agentClusterInstall}
            isOpen={isoModalOpen}
            onClose={() => setISOModalOpen(false)}
            onCreateBMH={onCreateBMH}
            onSaveISOParams={onSaveISOParams}
            usedHostnames={usedHostnames || []}
          />
        )}
    </Grid>
  );
};

export default ClusterDeploymentHostsDiscovery;
