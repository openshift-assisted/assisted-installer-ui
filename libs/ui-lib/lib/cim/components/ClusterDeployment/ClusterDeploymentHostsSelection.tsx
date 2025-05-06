import React from 'react';
import { useFormikContext } from 'formik';
import { Grid, GridItem, Content, Form } from '@patternfly/react-core';
import { SwitchField } from '../../../common';
import {
  ClusterDeploymentHostsSelectionProps,
  ClusterDeploymentHostsSelectionValues,
} from './types';
import ClusterDeploymentHostsSelectionBasic from './ClusterDeploymentHostsSelectionBasic';
import ClusterDeploymentHostsSelectionAdvanced from './ClusterDeploymentHostsSelectionAdvanced';
import {
  getAgentsForSelection,
  getClusterDeploymentCpuArchitecture,
  getIsSNOCluster,
} from '../helpers';
import MinimalHWRequirements from '../Agent/MinimalHWRequirements';
import NoAgentsAlert from '../Agent/NoAgentsAlert';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

const ClusterDeploymentHostsSelection: React.FC<ClusterDeploymentHostsSelectionProps> = ({
  agentClusterInstall,
  clusterDeployment,
  agents,
  aiConfigMap,
  onEditRole,
  onAutoSelectChange,
  onHostSelect,
  onSetInstallationDiskId,
  isNutanix,
}) => {
  const { values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();
  const { autoSelectHosts } = values;
  const isSNOCluster = getIsSNOCluster(agentClusterInstall);

  const cdName = clusterDeployment?.metadata?.name;
  const cdNamespace = clusterDeployment?.metadata?.namespace;
  const cpuArchitecture = getClusterDeploymentCpuArchitecture(clusterDeployment);

  const availableAgents = React.useMemo(() => {
    const filtered = getAgentsForSelection(agents).filter(
      (agent) =>
        (agent.spec.clusterDeploymentName?.name === cdName &&
          agent.spec.clusterDeploymentName?.namespace === cdNamespace) ||
        (!agent.spec.clusterDeploymentName?.name &&
          !agent.spec.clusterDeploymentName?.namespace &&
          agent.status?.inventory.cpu?.architecture === cpuArchitecture),
    );
    return isNutanix
      ? filtered.filter((a) => a.status?.inventory?.systemVendor?.manufacturer === 'Nutanix')
      : filtered;
  }, [agents, cdNamespace, cdName, cpuArchitecture, isNutanix]);
  const { t } = useTranslation();
  return (
    <Grid hasGutter>
      <GridItem>
        <Content>
          {isSNOCluster
            ? t(
                'ai:Exactly 1 host is required, capable of functioning both as control plane and worker node.',
              )
            : t('ai:At least 3 hosts are required, capable of functioning as control plane nodes.')}
        </Content>
      </GridItem>
      {aiConfigMap && (
        <GridItem>
          <MinimalHWRequirements aiConfigMap={aiConfigMap} isSNOCluster={isSNOCluster} />
        </GridItem>
      )}

      <GridItem>
        {availableAgents.length ? (
          <Form>
            <SwitchField
              name="autoSelectHosts"
              label={t('ai:Auto-select hosts')}
              onChange={onAutoSelectChange}
            />

            {autoSelectHosts && (
              <ClusterDeploymentHostsSelectionBasic
                availableAgents={availableAgents}
                isSNOCluster={isSNOCluster}
              />
            )}

            {!autoSelectHosts && (
              <ClusterDeploymentHostsSelectionAdvanced<ClusterDeploymentHostsSelectionValues>
                availableAgents={availableAgents}
                onEditRole={onEditRole}
                onHostSelect={onHostSelect}
                onSetInstallationDiskId={onSetInstallationDiskId}
                cpuArchitecture={cpuArchitecture}
              />
            )}
          </Form>
        ) : (
          <NoAgentsAlert cpuArchitecture={cpuArchitecture} />
        )}
      </GridItem>
    </Grid>
  );
};

export default ClusterDeploymentHostsSelection;
