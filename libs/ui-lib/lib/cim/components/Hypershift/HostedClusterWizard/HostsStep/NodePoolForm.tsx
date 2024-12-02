import {
  Button,
  Divider,
  ExpandableSectionToggle,
  Flex,
  FlexItem,
  Label,
  Level,
  LevelItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import * as React from 'react';
import { TrashIcon } from '@patternfly/react-icons/dist/js/icons/trash-icon';
import isMatch from 'lodash-es/isMatch.js';
import { PencilEditField } from '../../../../../common';
import { AgentK8sResource, InfraEnvK8sResource } from '../../../../types';
import { isAgentOfInfraEnv } from '../../../ClusterDeployment';
import { HostsFormValues } from './types';
import { useFormikContext } from 'formik';
import { getAgentsForSelection } from '../../../helpers';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';
import { useFormikHelpers } from '../../../../../common/hooks/useFormikHelpers';

import './NodePoolForm.css';
import NodePoolAgentsForm from '../../forms/NodePoolAgentsForm';

type NodePoolFormProps = {
  infraEnvs: InfraEnvK8sResource[];
  agents: AgentK8sResource[];
  index: number;
  onRemove: VoidFunction;
};

const NodePoolForm: React.FC<NodePoolFormProps> = ({ infraEnvs, agents, index, onRemove }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<HostsFormValues>();
  const { setValue: setCountValue } = useFormikHelpers(`nodePools[${index}].count`);
  const { setValue: setMinAutoscalingValue } = useFormikHelpers(
    `nodePools[${index}].autoscaling.minReplicas`,
  );
  const { setValue: setMaxAutoscalingValue } = useFormikHelpers(
    `nodePools[${index}].autoscaling.maxReplicas`,
  );
  const [isExpanded, setExpanded] = React.useState(true);
  const infraEnvAgents = React.useMemo(() => {
    const infraEnv = infraEnvs.find((ie) => ie.metadata?.namespace === values.agentNamespace);
    return agents.filter((agent) => isAgentOfInfraEnv(infraEnv, agent));
  }, [infraEnvs, agents, values.agentNamespace]);

  const { agentLabels } = values.nodePools[index];

  const availableAgents = getAgentsForSelection(infraEnvAgents);

  const matchingAgents = availableAgents.filter((agent) => {
    const labels = agentLabels.reduce<{ [key: string]: string }>((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {});
    return (
      isMatch(agent.metadata?.labels || {}, labels) &&
      !agent.spec.clusterDeploymentName?.name &&
      !agent.spec.clusterDeploymentName?.namespace
    );
  });

  let previousNodePoolsCount = 0;

  for (let i = 0; i < index; i++) {
    previousNodePoolsCount += values.nodePools[i].useAutoscaling
      ? values.nodePools[i].autoscaling.maxReplicas
      : values.nodePools[i].count;
  }

  const maxAgents = Math.max(
    0,
    Math.min(matchingAgents.length, availableAgents.length - previousNodePoolsCount),
  );

  const currentCount = values.nodePools[index].useAutoscaling
    ? values.nodePools[index].autoscaling.maxReplicas
    : values.nodePools[index].count;

  React.useEffect(() => {
    if (currentCount > maxAgents) {
      if (values.nodePools[index].useAutoscaling) {
        if (maxAgents === 0) {
          void setMinAutoscalingValue(maxAgents);
        }
        void setMaxAutoscalingValue(maxAgents);
      } else {
        void setCountValue(maxAgents);
      }
    }
  }, [
    maxAgents,
    currentCount,
    values.nodePools,
    index,
    setCountValue,
    setMinAutoscalingValue,
    setMaxAutoscalingValue,
  ]);

  return (
    <Stack hasGutter>
      <StackItem>
        <Level hasGutter>
          <LevelItem>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsMd' }}
              flexWrap={{ default: 'wrap' }}
            >
              <FlexItem>
                <Split className="ai-node-pool__header">
                  <SplitItem>
                    <ExpandableSectionToggle
                      className="ai-node-pool__expandable-button"
                      isExpanded={isExpanded}
                      onToggle={setExpanded}
                    />
                  </SplitItem>
                  <SplitItem>
                    <PencilEditField
                      name={`nodePools.${index}.nodePoolName`}
                      isRequired
                      showErrorMessage={false}
                    />
                  </SplitItem>
                </Split>
              </FlexItem>
              {!isExpanded && (
                <>
                  <FlexItem>
                    <Divider orientation={{ default: 'vertical' }} />
                  </FlexItem>
                  <FlexItem>
                    <Label variant="outline">
                      {t('ai:{{count}} filtering label', {
                        count: values.nodePools[index].agentLabels.length,
                      })}
                    </Label>
                  </FlexItem>
                </>
              )}
            </Flex>
          </LevelItem>
          {index !== 0 && (
            <LevelItem>
              <Button variant="link" icon={<TrashIcon />} onClick={onRemove} />
            </LevelItem>
          )}
        </Level>
      </StackItem>
      {isExpanded && (
        <StackItem className="ai-node-pool__section">
          <NodePoolAgentsForm
            agents={infraEnvAgents}
            countName={`nodePools.${index}.count`}
            labelName={`nodePools.${index}.agentLabels`}
            autoscalingName={`nodePools.${index}.autoscaling`}
            useAutoscalingName={`nodePools.${index}.useAutoscaling`}
            maxAgents={maxAgents}
          />
        </StackItem>
      )}
    </Stack>
  );
};

export default NodePoolForm;
