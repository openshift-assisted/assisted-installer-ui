import React from 'react';
import {
  Grid,
  GridItem,
  TextContent,
  Text,
  TextListItem,
  OrderType,
  TextList,
} from '@patternfly/react-core';
import Measure from 'react-measure';
import {
  DiscoveryTroubleshootingModal,
  FormatDiskWarning,
  HostsNotShowingLink,
  VMRebootConfigurationInfo,
} from '../../../../common';
import { getIsSNOCluster, onAgentChangeHostname } from '../../helpers';
import MinimalHWRequirements from '../../Agent/MinimalHWRequirements';
import { ClusterDeploymentHostsDiscoveryProps } from '../types';
import { EditBMHModal, EditAgentModal } from '../../modals';
import { AgentK8sResource, BareMetalHostK8sResource } from '../../../types';
import ClusterDeploymentHostDiscoveryTable from './ClusterDeploymentHostDiscoveryTable';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import AddHostDropdown from '../../InfraEnv/AddHostDropdown';

const DiscoveryInstructions = () => {
  const { t } = useTranslation();
  return (
    <TextContent>
      <Text component="h3">{t('ai:Adding hosts instructions')}</Text>
      <TextList component="ol" type={OrderType.number} style={{ marginLeft: 0 }}>
        <TextListItem>{t('ai:Click the Add hosts button.')}</TextListItem>
        <TextListItem>
          {t('ai:Configure the SSH key and proxy settings after the modal appears (optional).')}
        </TextListItem>
        <TextListItem>
          {t(
            "ai:Select how you'd like to add hosts (Discovery ISO, iPXE, or BMC form) and follow the instructions that appear.",
          )}
        </TextListItem>
        <TextListItem>
          {t(
            'ai:Booted hosts should appear in the host inventory table. This may take a few minutes.',
          )}
        </TextListItem>
      </TextList>
    </TextContent>
  );
};

const ClusterDeploymentHostsDiscovery: React.FC<ClusterDeploymentHostsDiscoveryProps> = ({
  agentClusterInstall,
  agents,
  bareMetalHosts,
  aiConfigMap,
  infraEnv,
  infraNMStates,
  usedHostnames,
  onChangeHostname,
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
          <DiscoveryInstructions />
        </TextContent>
      </GridItem>
      <GridItem span={5}>
        <AddHostDropdown
          infraEnv={infraEnv}
          agentClusterInstall={agentClusterInstall}
          usedHostnames={usedHostnames}
          {...rest}
        />
      </GridItem>
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
                onChangeHostname={onChangeHostname}
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
        {editAgent && (
          <EditAgentModal
            onClose={() => setEditAgent(undefined)}
            usedHostnames={usedHostnames}
            agent={editAgent}
            onSave={onAgentChangeHostname(
              agents,
              bareMetalHosts,
              onChangeHostname,
              onChangeBMHHostname,
            )}
          />
        )}
      </GridItem>
      <DiscoveryTroubleshootingModal
        isOpen={isDiscoveryHintModalOpen}
        setDiscoveryHintModalOpen={setDiscoveryHintModalOpen}
      />
    </Grid>
  );
};

export default ClusterDeploymentHostsDiscovery;
