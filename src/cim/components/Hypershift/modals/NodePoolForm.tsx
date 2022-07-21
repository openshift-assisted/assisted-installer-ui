import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Form,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import * as React from 'react';
import { InputField, OpenshiftVersionOptionType, OpenShiftVersionSelect } from '../../../../common';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { AgentK8sResource } from '../../../types';
import { getAgentsForSelection } from '../../helpers';
import NodePoolAgentsForm from '../forms/NodePoolAgentsForm';
import { AgentMachineK8sResource, HostedClusterK8sResource, NodePoolK8sResource } from '../types';
import { getNodepoolAgents } from '../utils';

export type NodePoolFormValues = {
  nodePoolName: string;
  agentLabels: {
    key: string;
    value: string;
  }[];
  count: number;
  openshiftVersion: string;
};

type NodePoolFormProps = {
  agents: AgentK8sResource[];
  agentMachines?: AgentMachineK8sResource[];
  hostedCluster: HostedClusterK8sResource;
  nodePool?: NodePoolK8sResource;
  ocpVersions?: OpenshiftVersionOptionType[];
};

const NodePoolForm = ({
  agents,
  nodePool,
  hostedCluster,
  ocpVersions,
  agentMachines,
}: NodePoolFormProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<NodePoolFormValues>();

  const isEdit = !!nodePool && !!agentMachines;

  let maxAgents = 0;

  const availableAgents = getAgentsForSelection(agents).filter(
    (agent) =>
      values.agentLabels.every(({ key, value }) => agent.metadata?.labels?.[key] === value) &&
      !agent.spec.clusterDeploymentName,
  );

  if (isEdit) {
    const nodePoolAgents = getNodepoolAgents(nodePool, agents, agentMachines, hostedCluster);
    maxAgents =
      nodePoolAgents.length +
      availableAgents.filter(
        (agent) => !nodePoolAgents.find((a) => a.metadata?.uid === agent.metadata?.uid),
      ).length;
  } else {
    maxAgents += availableAgents.length;
  }

  return (
    <Form>
      <Grid hasGutter>
        <GridItem>
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('ai:Host namespace')}</DescriptionListTerm>
              <DescriptionListDescription>
                {hostedCluster.spec.platform.agent?.agentNamespace}
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
        <GridItem>
          {nodePool ? (
            <DescriptionList isHorizontal>
              <DescriptionListGroup>
                <DescriptionListTerm>{t('ai:Nodepool')}</DescriptionListTerm>
                <DescriptionListDescription>{nodePool.metadata?.name}</DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          ) : (
            <InputField name="nodePoolName" isRequired label={t('ai:Nodepool name')} />
          )}
        </GridItem>
        {ocpVersions && (
          <GridItem>
            <OpenShiftVersionSelect versions={ocpVersions} />
          </GridItem>
        )}
        <GridItem>
          <NodePoolAgentsForm
            agents={agents}
            countName="count"
            labelName="agentLabels"
            maxAgents={maxAgents}
          />
        </GridItem>
      </Grid>
    </Form>
  );
};

export default NodePoolForm;
