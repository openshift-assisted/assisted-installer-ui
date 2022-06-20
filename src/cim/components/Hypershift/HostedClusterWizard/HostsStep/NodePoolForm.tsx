import {
  Button,
  Divider,
  ExpandableSectionToggle,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Label,
  Level,
  LevelItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { TrashIcon } from '@patternfly/react-icons';
import { CheckboxField, NumberInputField, PencilEditField } from '../../../../../common';
import { AgentK8sResource, InfraEnvK8sResource } from '../../../../types';
import { LabelSelectorGroup } from '../../../ClusterDeployment/LabelsSelector';
import HostsAdvancedSelection from './HostsAdvancedSelection';
import { getTotalCompute, isAgentOfInfraEnv } from '../../../ClusterDeployment';
import { HostsFormValues } from './types';
import { useFormikContext } from 'formik';
import { getAgentsForSelection } from '../../../helpers';
import { AGENT_TO_NODE_POOL_NAME, AGENT_TO_NODE_POOL_NS } from '../constants';
import { useDeepCompareMemoize } from '../../../../../common/hooks';

import './NodePoolForm.css';
import AgentsSelectionHostCountLabelIcon from '../../../Agent/AgentsSelectionHostCountLabelIcon';

export const agentLabelKeysFilter: string[] = [AGENT_TO_NODE_POOL_NAME, AGENT_TO_NODE_POOL_NS];

type NodePoolFormProps = {
  infraEnvs: InfraEnvK8sResource[];
  agents: AgentK8sResource[];
  index: number;
  onRemove: VoidFunction;
};

const NodePoolForm: React.FC<NodePoolFormProps> = ({ infraEnvs, agents, index, onRemove }) => {
  const { values, setFieldValue } = useFormikContext<HostsFormValues>();
  const [isExpanded, setExpanded] = React.useState(true);
  const infraEnvAgents = React.useMemo(() => {
    const infraEnv = infraEnvs.find((ie) => ie.metadata?.namespace === values.agentNamespace);
    return agents.filter((agent) => isAgentOfInfraEnv(infraEnv, agent));
  }, [infraEnvs, agents, values.agentNamespace]);

  const { agentLabels, manualHostSelect, autoSelectedAgentIDs } = values.nodePools[index];

  const matchingAgents = React.useMemo(
    () =>
      getAgentsForSelection(infraEnvAgents).filter((agent) => {
        const labels = agentLabels.reduce((acc, curr) => {
          const keyValue = curr.split('=');
          acc[keyValue[0]] = keyValue[1];
          return acc;
        }, {});

        const hasLabels = Object.keys(labels).every(
          (key) => agent.metadata?.labels?.[key] === labels[key],
        );
        return (
          hasLabels &&
          !agent.spec.clusterDeploymentName?.name &&
          !agent.spec.clusterDeploymentName?.namespace
        );
      }),
    [infraEnvAgents, agentLabels],
  );

  const autoSelectedAgents = React.useMemo(
    () => agents.filter((agent) => autoSelectedAgentIDs.includes(agent.metadata?.uid || '')),
    [autoSelectedAgentIDs, agents],
  );

  const reservedAgentIDs = useDeepCompareMemoize(
    values.nodePools.slice(0, index).reduce<string[]>((acc, nodePool) => {
      acc.push(
        ...(nodePool.manualHostSelect ? nodePool.selectedAgentIDs : nodePool.autoSelectedAgentIDs),
      );
      return acc;
    }, []),
  );

  const availableAgents = React.useMemo(
    () => matchingAgents.filter((agent) => !reservedAgentIDs.includes(agent.metadata?.uid || '')),
    [matchingAgents, reservedAgentIDs],
  );

  React.useEffect(() => {
    const availableAgentIDs = availableAgents.map((a) => a.metadata?.uid || '');
    const ids = availableAgents.slice(0, values.nodePools[index].count).map((a) => a.metadata?.uid);
    if (
      !values.nodePools[index].manualHostSelect &&
      values.nodePools[index].autoSelectedAgentIDs.length === 0 &&
      ids.length !== 0
    ) {
      setFieldValue(`nodePools.${index}.autoSelectedAgentIDs`, ids);
    } else {
      const availableAutoSelectedAgents = autoSelectedAgents.filter((a) =>
        availableAgentIDs.includes(a.metadata?.uid || ''),
      );
      if (
        !isEqual(
          availableAutoSelectedAgents.map((a) => a.metadata?.uid || ''),
          autoSelectedAgents.map((a) => a.metadata?.uid || ''),
        )
      ) {
        const newNodePools = [...values.nodePools];
        newNodePools[index].autoSelectedAgentIDs = availableAutoSelectedAgents.map(
          (a) => a.metadata?.uid || '',
        );
        setFieldValue('nodePools', newNodePools);
      }
    }
  }, [availableAgents, autoSelectedAgents, setFieldValue, index, values.nodePools]);

  const selectedAgents = values.nodePools[index].manualHostSelect
    ? agents.filter((a) => values.nodePools[index].selectedAgentIDs.includes(a.metadata?.uid || ''))
    : autoSelectedAgents;

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
                    <PencilEditField name={`nodePools.${index}.name`} isRequired />
                  </SplitItem>
                </Split>
              </FlexItem>
              {!isExpanded && (
                <>
                  <FlexItem>
                    <Divider isVertical />
                  </FlexItem>
                  <FlexItem>
                    <Label color="green">{`${selectedAgents.length} Hosts: ${getTotalCompute(
                      selectedAgents,
                    )}`}</Label>
                  </FlexItem>
                  <FlexItem>
                    <Label variant="outline">{`${values.nodePools[index].agentLabels.length} filtering labels`}</Label>
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
          <Grid hasGutter>
            <GridItem>
              <LabelSelectorGroup
                agents={infraEnvAgents}
                labelKeysFilter={agentLabelKeysFilter}
                name={`nodePools.${index}.agentLabels`}
              />
            </GridItem>
            <GridItem>
              <CheckboxField
                name={`nodePools.${index}.manualHostSelect`}
                label="Manual host selection"
              />
            </GridItem>
            {!manualHostSelect ? (
              <GridItem>
                <NumberInputField
                  label="Number of hosts"
                  labelIcon={<AgentsSelectionHostCountLabelIcon />}
                  idPostfix="count"
                  name={`nodePools.${index}.count`}
                  isRequired
                  minValue={1}
                  maxValue={availableAgents.length}
                  onChange={(value) => {
                    setFieldValue(
                      `nodePools.${index}.autoSelectedAgentIDs`,
                      availableAgents.slice(0, value).map((a) => a.metadata?.uid),
                    );
                  }}
                  helperText={`Maximum availability ${availableAgents.length}`}
                />
              </GridItem>
            ) : (
              <HostsAdvancedSelection agents={availableAgents} index={index} />
            )}
          </Grid>
        </StackItem>
      )}
    </Stack>
  );
};

export default NodePoolForm;
