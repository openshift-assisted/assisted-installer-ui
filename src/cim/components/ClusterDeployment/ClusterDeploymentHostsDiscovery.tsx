import React from 'react';
import { Grid, GridItem, TextContent, Text } from '@patternfly/react-core';
import Measure from 'react-measure';
import {
  DiscoveryInstructions,
  DiscoveryTroubleshootingModal,
  FormatDiskWarning,
  HostsNotShowingLink,
  VMRebootConfigurationInfo,
} from '../../../common';
import { getIsSNOCluster } from '../helpers';
import MinimalHWRequirements from '../Agent/MinimalHWRequirements';
import { ClusterDeploymentHostsDiscoveryProps } from './types';
import { EditBMHModal, EditAgentModal } from '../modals';
import { AgentK8sResource, BareMetalHostK8sResource } from '../../types';
import ClusterDeploymentHostDiscoveryTable from './ClusterDeploymentHostDiscoveryTable';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';
import AddHostDropdown from '../InfraEnv/AddHostDropdown';

const ClusterDeploymentHostsDiscovery: React.FC<ClusterDeploymentHostsDiscoveryProps> = ({
  agentClusterInstall,
  agents,
  bareMetalHosts,
  aiConfigMap,
  infraEnv,
  infraNMStates,
  usedHostnames,
  onSaveAgent,
  onEditRole,
  onSetInstallationDiskId,
  onSaveBMH,
  fetchSecret,
  onChangeBMHHostname,
  onApproveAgent,
  onDeleteHost,
  ...rest
}) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const [editBMH, setEditBMH] = React.useState<BareMetalHostK8sResource>();
  const [editAgent, setEditAgent] = React.useState<AgentK8sResource | undefined>();

  const isVM = true; // TODO(mlibra): calculate from agent's inventory

  const isSNOCluster = getIsSNOCluster(agentClusterInstall);
  const { t } = useTranslation();
  return (
    <Grid hasGutter>
      <GridItem>
        <TextContent>
          <DiscoveryInstructions showAllInstructions />
        </TextContent>
      </GridItem>
      <AddHostDropdown
        infraEnv={infraEnv}
        agentClusterInstall={agentClusterInstall}
        usedHostnames={usedHostnames}
        {...rest}
      />
      <GridItem>
        <TextContent>
          <Text component="h3">{t('ai:Information and warnings')}</Text>
          {aiConfigMap && (
            <Text component="p">
              <MinimalHWRequirements aiConfigMap={aiConfigMap} isSNOCluster={isSNOCluster} />
            </Text>
          )}
          <Text component="p">
            <HostsNotShowingLink setDiscoveryHintModalOpen={setDiscoveryHintModalOpen} />
          </Text>
          {isVM && <VMRebootConfigurationInfo />}
        </TextContent>
      </GridItem>
      <GridItem>
        {/* <OCSDisksManualFormattingHint /> Recently not used in the ACM flow */}
        <FormatDiskWarning />
      </GridItem>

      <GridItem>
        <Measure bounds>
          {({ measureRef, contentRect }) => (
            <div ref={measureRef}>
              <ClusterDeploymentHostDiscoveryTable
                agents={agents}
                bareMetalHosts={bareMetalHosts}
                infraEnv={infraEnv}
                onEditHost={setEditAgent}
                onEditRole={onEditRole}
                onSetInstallationDiskId={onSetInstallationDiskId}
                onEditBMH={setEditBMH}
                onChangeHostname={onSaveAgent}
                onChangeBMHHostname={onChangeBMHHostname}
                onApprove={onApproveAgent}
                width={contentRect.bounds?.width}
                onDeleteHost={onDeleteHost}
              />
            </div>
          )}
        </Measure>
        <EditBMHModal
          infraEnv={infraEnv}
          bmh={editBMH}
          nmStates={infraNMStates}
          isOpen={!!editBMH}
          onClose={() => setEditBMH(undefined)}
          onEdit={onSaveBMH}
          fetchSecret={fetchSecret}
          usedHostnames={usedHostnames || []}
        />
        <EditAgentModal
          isOpen={!!editAgent}
          onClose={() => setEditAgent(undefined)}
          usedHostnames={usedHostnames}
          agent={editAgent}
          onSave={onSaveAgent}
        />
      </GridItem>
      <DiscoveryTroubleshootingModal
        isOpen={isDiscoveryHintModalOpen}
        setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
      />
    </Grid>
  );
};

export default ClusterDeploymentHostsDiscovery;
