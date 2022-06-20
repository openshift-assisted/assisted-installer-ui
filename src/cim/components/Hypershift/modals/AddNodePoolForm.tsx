import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { useFormikContext } from 'formik';
import * as React from 'react';
import {
  CheckboxField,
  InputField,
  NumberInputField,
  OpenshiftVersionOptionType,
  OpenShiftVersionSelect,
} from '../../../../common';
import { useFormikHelpers } from '../../../../common/hooks/useFormikHelpers';
import { AgentK8sResource } from '../../../types';
import AgentsSelectionHostCountLabelIcon from '../../Agent/AgentsSelectionHostCountLabelIcon';
import { LabelSelectorGroup } from '../../ClusterDeployment/LabelsSelector';
import { getAgentsForSelection } from '../../helpers';
import { AGENT_TO_NODE_POOL_NAME, AGENT_TO_NODE_POOL_NS } from '../HostedClusterWizard';
import { agentLabelKeysFilter } from '../HostedClusterWizard/HostsStep/NodePoolForm';
import HostsSelectionTable from '../HostsSelectionTable/HostsSelectionTable';
import { HostedClusterK8sResource, NodePoolK8sResource } from '../types';

export type AddNodePoolFormValues = {
  nodePoolName: string;
  agentLabels: string[];
  manualHostSelect: boolean;
  count: number;
  autoSelectedAgentIDs: string[];
  selectedAgentIDs: string[];
  openshiftVersion: string;
};

type HostsAdvancedSelectionProps = {
  agents: AgentK8sResource[];
};

const HostsAdvancedSelection = ({ agents }: HostsAdvancedSelectionProps) => {
  const { values } = useFormikContext<AddNodePoolFormValues>();
  const { setValue, valueRef } =
    useFormikHelpers<AddNodePoolFormValues['selectedAgentIDs']>('selectedAgentIDs');

  const onSelect = React.useCallback(
    (agent: AgentK8sResource, selected: boolean) => {
      selected
        ? setValue([...valueRef.current, agent.metadata?.uid || ''])
        : setValue(valueRef.current.filter((uid) => uid !== agent.metadata?.uid));
    },
    [setValue, valueRef],
  );
  return (
    <HostsSelectionTable
      agents={agents}
      onSelect={onSelect}
      selectedIDs={values.selectedAgentIDs}
      setSelectedIDs={setValue}
    />
  );
};

type AddNodePoolFormProps = {
  agents: AgentK8sResource[];
  hostedCluster: HostedClusterK8sResource;
  nodePool?: NodePoolK8sResource;
  ocpVersions?: OpenshiftVersionOptionType[];
};

const AddNodePoolForm = ({
  agents,
  nodePool,
  hostedCluster,
  ocpVersions,
}: AddNodePoolFormProps) => {
  const { values, setFieldValue } = useFormikContext<AddNodePoolFormValues>();

  const isEdit = !!nodePool;

  const cdName = hostedCluster.metadata?.name;
  const cdNamespace = `${hostedCluster.metadata?.namespace || ''}-${
    hostedCluster.metadata?.name || ''
  }`;

  const matchingAgents = React.useMemo(
    () =>
      getAgentsForSelection(agents, cdName, cdNamespace).filter((agent) => {
        const labels = values.agentLabels.reduce((acc, curr) => {
          const keyValue = curr.split('=');
          acc[keyValue[0]] = keyValue[1];
          return acc;
        }, {});

        const hasLabels = Object.keys(labels).every(
          (key) => agent.metadata?.labels?.[key] === labels[key],
        );

        let isAvailable = false;
        if (isEdit) {
          isAvailable =
            agent.metadata?.labels?.[AGENT_TO_NODE_POOL_NAME] === undefined ||
            (agent.metadata?.labels?.[AGENT_TO_NODE_POOL_NAME] === nodePool?.metadata?.name &&
              agent.metadata?.labels?.[AGENT_TO_NODE_POOL_NS] === nodePool?.metadata?.namespace);
        } else {
          isAvailable =
            !agent.metadata?.labels?.[AGENT_TO_NODE_POOL_NAME] && !agent.spec.clusterDeploymentName;
        }

        return hasLabels && isAvailable;
      }),
    [
      agents,
      values.agentLabels,
      isEdit,
      cdName,
      cdNamespace,
      nodePool?.metadata?.name,
      nodePool?.metadata?.namespace,
    ],
  );

  React.useEffect(() => {
    matchingAgents?.[0]?.metadata?.uid &&
      setFieldValue('autoSelectedAgentIDs', [matchingAgents?.[0]?.metadata?.uid]);
    // eslint-disable-next-line
  }, []);

  return (
    <Grid hasGutter>
      <GridItem>
        <DescriptionList isHorizontal>
          <DescriptionListGroup>
            <DescriptionListTerm>Host namespace</DescriptionListTerm>
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
              <DescriptionListTerm>Nodepool</DescriptionListTerm>
              <DescriptionListDescription>{nodePool.metadata?.name}</DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        ) : (
          <InputField name="nodePoolName" isRequired label="Nodepool name" />
        )}
      </GridItem>
      {ocpVersions && (
        <GridItem>
          <OpenShiftVersionSelect versions={ocpVersions} />
        </GridItem>
      )}
      <GridItem>
        <LabelSelectorGroup
          agents={agents}
          labelKeysFilter={agentLabelKeysFilter}
          name="agentLabels"
        />
      </GridItem>
      <GridItem>
        <CheckboxField name="manualHostSelect" label="Manual host selection" />
      </GridItem>
      {!values.manualHostSelect ? (
        <>
          <GridItem>
            <NumberInputField
              label="Number of hosts"
              labelIcon={<AgentsSelectionHostCountLabelIcon />}
              idPostfix="count"
              name="count"
              isRequired
              minValue={1}
              maxValue={matchingAgents.length}
              onChange={(value) => {
                setFieldValue(
                  'autoSelectedAgentIDs',
                  matchingAgents.slice(0, value).map((a) => a.metadata?.uid),
                );
              }}
              helperText={`Maximum availability ${matchingAgents.length}`}
            />
          </GridItem>
        </>
      ) : (
        <HostsAdvancedSelection agents={matchingAgents} />
      )}
    </Grid>
  );
};

export default AddNodePoolForm;
