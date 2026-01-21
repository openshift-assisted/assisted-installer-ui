import React from 'react';
import { useFormikContext } from 'formik';
import { Grid, GridItem, Content, Form } from '@patternfly/react-core';
import { SwitchField } from '@openshift-assisted/common';
import {
  ClusterDeploymentHostsSelectionProps,
  ClusterDeploymentHostsSelectionValues,
} from '../types';
import ClusterDeploymentHostsSelectionBasic from './ClusterDeploymentHostsSelectionBasic';
import { ClusterDeploymentHostsSelectionAdvanced } from './ClusterDeploymentHostsSelectionAdvanced';
import {
  getAgentsForSelection,
  getClusterDeploymentCpuArchitecture,
  getIsSNOCluster,
  getIsTNACluster,
} from '../../helpers';
import MinimalHWRequirements from '../../Agent/MinimalHWRequirements';
import NoAgentsAlert from '../../Agent/NoAgentsAlert';
import { useTranslation } from '@openshift-assisted/common/hooks/use-translation-wrapper';
import { TFunction } from 'i18next';

const getHostRequirementText = (isSNO: boolean, isTNA: boolean, t: TFunction) => {
  if (isSNO) {
    return t(
      'ai:Exactly 1 host is required, capable of functioning both as control plane and worker node.',
    );
  } else if (isTNA) {
    return t(
      'ai:Exactly 2 hosts capable of functioning as control plane nodes, and one arbiter, are required.',
    );
  }
  return t('ai:At least 3 hosts are required, capable of functioning as control plane nodes.');
};

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
  hostsBinding,
}) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();
  const { autoSelectHosts } = values;
  const isSNOCluster = getIsSNOCluster(agentClusterInstall);
  const isTNA = getIsTNACluster(agentClusterInstall);

  const cdName = clusterDeployment?.metadata?.name;
  const cdNamespace = clusterDeployment?.metadata?.namespace;
  const cpuArchitecture = getClusterDeploymentCpuArchitecture(clusterDeployment);

  const availableAgents = React.useMemo(() => {
    const filtered = getAgentsForSelection(agents, hostsBinding).filter(
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
  }, [agents, hostsBinding, isNutanix, cdName, cdNamespace, cpuArchitecture]);

  const hostRequirementText = getHostRequirementText(isSNOCluster, isTNA, t);

  return (
    <Grid hasGutter>
      <GridItem>
        <Content>{hostRequirementText}</Content>
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
