import {
  Button,
  ExpandableSectionToggle,
  Grid,
  GridItem,
  Split,
  SplitItem,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import * as React from 'react';
import isEqual from 'lodash/isEqual';
import { TrashIcon } from '@patternfly/react-icons';
import { InputField, NumberInputField, SwitchField } from '../../../../../common';
import { AgentK8sResource, InfraEnvK8sResource } from '../../../../types';
import AgentsSelectionHostCountAlerts from '../../../Agent/AgentsSelectionHostCountAlerts';
import AgentsSelectionHostCountLabelIcon from '../../../Agent/AgentsSelectionHostCountLabelIcon';
import LabelsSelector, { infraEnvLabelKeys } from '../../../ClusterDeployment/LabelsSelector';
import HostsAdvancedSelection from './HostsAdvancedSelection';
import { isAgentOfInfraEnv } from '../../../ClusterDeployment';
import { HostsFormValues } from './types';
import { useFormikContext } from 'formik';
import { getAgentsForSelection } from '../../../helpers';
import { AGENT_TO_HOSTED_CLUSTER } from '../constants';
import { useDeepCompareMemoize } from '../../../../../common/hooks';

import './NodePoolForm.css';
import { useTranslation } from '../../../../../common/hooks/use-translation-wrapper';

const agentLabelKeysFilter = [...infraEnvLabelKeys, AGENT_TO_HOSTED_CLUSTER];

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

  const { agentLabels, autoSelectHosts, autoSelectedAgentIDs } = values.nodePools[index];

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
        ...(nodePool.autoSelectHosts ? nodePool.autoSelectedAgentIDs : nodePool.selectedAgentIDs),
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
      values.nodePools[index].autoSelectHosts &&
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
  const { t } = useTranslation();
  return (
    <Stack hasGutter>
      <StackItem>
        <Split hasGutter>
          <SplitItem isFilled>
            <ExpandableSectionToggle
              className="ai-node-pool__expandable-button"
              isExpanded={isExpanded}
              onToggle={setExpanded}
            >{`Node pool ${index + 1}`}</ExpandableSectionToggle>
          </SplitItem>
          {index !== 0 && (
            <SplitItem>
              <Button variant="link" icon={<TrashIcon />} onClick={onRemove} />
            </SplitItem>
          )}
        </Split>
      </StackItem>
      {isExpanded && (
        <StackItem className="ai-node-pool__section">
          <Grid hasGutter>
            <GridItem>
              <InputField
                name={`nodePools.${index}.name`}
                isRequired
                label={t('ai:Node pool name')}
              />
            </GridItem>
            <GridItem>
              <LabelsSelector
                agents={infraEnvAgents}
                labelKeysFilter={agentLabelKeysFilter}
                name={`nodePools.${index}.agentLabels`}
              />
            </GridItem>
            <GridItem>
              <SwitchField
                name={`nodePools.${index}.autoSelectHosts`}
                label={t('ai:Auto-select hosts')}
              />
            </GridItem>
            {autoSelectHosts ? (
              <>
                <GridItem>
                  <NumberInputField
                    label={t('ai:Number of workers')}
                    labelIcon={<AgentsSelectionHostCountLabelIcon />}
                    idPostfix="count"
                    name={`nodePools.${index}.count`}
                    isRequired
                    minValue={1}
                    onChange={(value) => {
                      setFieldValue(
                        `nodePools.${index}.autoSelectedAgentIDs`,
                        availableAgents.slice(0, value).map((a) => a.metadata?.uid),
                      );
                    }}
                  />
                </GridItem>
                <GridItem>
                  <AgentsSelectionHostCountAlerts
                    matchingAgentsCount={availableAgents.length}
                    selectedAgents={autoSelectedAgents}
                    targetHostCount={values.nodePools[index].count}
                  />
                </GridItem>
              </>
            ) : (
              <HostsAdvancedSelection
                infraEnvAgents={infraEnvAgents}
                agents={availableAgents}
                index={index}
              />
            )}
          </Grid>
        </StackItem>
      )}
    </Stack>
  );
};

export default NodePoolForm;
