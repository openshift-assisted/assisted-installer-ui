import React from 'react';
import { Grid, GridItem, TextContent, Text, Button, ButtonVariant } from '@patternfly/react-core';
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
import { AddHostModal, EditBMHModal, EditAgentModal } from '../modals';
import { AgentK8sResource, BareMetalHostK8sResource } from '../../types';
import ClusterDeploymentHostDiscoveryTable from './ClusterDeploymentHostDiscoveryTable';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

// TODO either make "onSaveISOParams" optional everywhere, or make it required and ensure it's set
const dummyOnSaveISOParams = () => Promise.resolve();

const ClusterDeploymentHostsDiscovery: React.FC<ClusterDeploymentHostsDiscoveryProps> = ({
  agentClusterInstall,
  agents,
  bareMetalHosts,
  aiConfigMap,
  infraEnv,
  infraNMStates,
  usedHostnames,
  onCreateBMH,
  onSaveAgent,
  onEditRole,
  onSetInstallationDiskId,
  onSaveBMH,
  onSaveISOParams,
  fetchSecret,
  onChangeBMHHostname,
  onApproveAgent,
  onDeleteHost,
  isBMPlatform,
}) => {
  const [isDiscoveryHintModalOpen, setDiscoveryHintModalOpen] = React.useState(false);
  const [isoModalOpen, setISOModalOpen] = React.useState(false);
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
      {!!onCreateBMH && (
        <GridItem>
          <Button variant={ButtonVariant.primary} onClick={() => setISOModalOpen(true)}>
            {t('ai:Add host')}
          </Button>
        </GridItem>
      )}

      <GridItem>
        <TextContent>
          <Text component="h3">{t('ai:Information and warnings')}</Text>
          <Text component="p">
            {aiConfigMap && (
              <MinimalHWRequirements aiConfigMap={aiConfigMap} isSNOCluster={isSNOCluster} />
            )}
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
      {!!onCreateBMH &&
        isoModalOpen /* Do not use isOpen props to re-initialize when re-opening */ && (
          <AddHostModal
            infraEnv={infraEnv}
            agentClusterInstall={agentClusterInstall}
            isOpen={isoModalOpen}
            onClose={() => setISOModalOpen(false)}
            onCreateBMH={onCreateBMH}
            onSaveISOParams={onSaveISOParams || dummyOnSaveISOParams}
            usedHostnames={usedHostnames || []}
            isBMPlatform={isBMPlatform}
          />
        )}
    </Grid>
  );
};

export default ClusterDeploymentHostsDiscovery;
