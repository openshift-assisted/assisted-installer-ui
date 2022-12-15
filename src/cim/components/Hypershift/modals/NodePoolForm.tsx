import * as React from 'react';
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

import { InputField } from '../../../../common';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';
import { AgentK8sResource } from '../../../types';
import { getAgentsForSelection, getVersionFromReleaseImage } from '../../helpers';
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
};

type NodePoolFormProps = {
  agents: AgentK8sResource[];
  agentMachines?: AgentMachineK8sResource[];
  hostedCluster: HostedClusterK8sResource;
  nodePool?: NodePoolK8sResource;
};

const NodePoolForm = ({ agents, nodePool, hostedCluster, agentMachines }: NodePoolFormProps) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<NodePoolFormValues>();

  const isEdit = !!nodePool && !!agentMachines;

  let maxAgents = 0;

  const availableAgents = getAgentsForSelection(agents).filter(
    (agent) =>
      values.agentLabels.every(({ key, value }) => agent.metadata?.labels?.[key] === value) &&
      !agent.spec.clusterDeploymentName,
  );

  const ocpVersion = getVersionFromReleaseImage(hostedCluster.spec.release.image);

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
        <GridItem>
          <NodePoolAgentsForm
            agents={agents}
            countName="count"
            labelName="agentLabels"
            maxAgents={maxAgents}
          />
        </GridItem>
        <GridItem>
          <DescriptionList isHorizontal>
            <DescriptionListGroup>
              <DescriptionListTerm>{t('ai:OpenShift version')}</DescriptionListTerm>
              <DescriptionListDescription>{ocpVersion}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </GridItem>
      </Grid>
    </Form>
  );
};

export default NodePoolForm;
