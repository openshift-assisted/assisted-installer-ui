import React from 'react';
import { useFormikContext } from 'formik';
import { Grid, GridItem, AlertGroup, Alert, AlertVariant } from '@patternfly/react-core';
import {
  CheckboxField,
  ClusterWizardStepHeader,
  LabelField,
  MultiSelectField,
  NumberInputField,
  PopoverIcon,
} from '../../../common';
import { AGENT_LOCATION_LABEL_KEY } from '../common';
import {
  ClusterDeploymentHostsSelectionProps,
  ClusterDeploymentHostsSelectionValues,
} from './types';
import { HOSTS_MAX_COUNT, HOSTS_MIN_COUNT } from './constants';
import { AgentTable } from '../Agent';
import { AgentK8sResource } from '../../types';

// TODO(mlibra): Something more descriptive
const HostCountLabelIcon: React.FC = () => <>Total count of hosts included in the cluster.</>;

const LocationsLabel: React.FC = () => (
  <>
    Locations{' '}
    <PopoverIcon
      bodyContent={
        <>
          Select one or multiple locations to choose the hosts from.
          <br />
          Keep the field empty to match <b>any</b> location.
          <br />
          Set <b>{AGENT_LOCATION_LABEL_KEY}</b> label in Agent resource to specify it's location.
        </>
      }
    />
  </>
);

// TODO(mlibra): implement for Single Node Cluster as well
const ClusterDeploymentHostsSelection: React.FC<ClusterDeploymentHostsSelectionProps> = ({
  usedAgentLabels = [],
  agentLocations = [],
  matchingAgents,
  allAgentsCount,
  onAgentSelectorChange,
  hostActions,
}) => {
  const { setFieldValue, values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();
  const { hostCount } = values;

  const usedAgentLabelsWithoutLocation = usedAgentLabels
    .filter((key) => key !== AGENT_LOCATION_LABEL_KEY)
    .sort();

  const onHostSelected = (agent: AgentK8sResource, selected: boolean) => {
    if (selected) {
      setFieldValue('selectedHostIds', [...values.selectedHostIds, agent.metadata?.uid]);
    } else {
      setFieldValue(
        'selectedHostIds',
        values.selectedHostIds.filter((uid) => uid !== agent.metadata?.uid),
      );
    }
  };

  return (
    <Grid hasGutter>
      <GridItem>
        <ClusterWizardStepHeader>Hosts selection</ClusterWizardStepHeader>
      </GridItem>

      <GridItem span={12} lg={10} xl={9} xl2={7}>
        <NumberInputField
          labelIcon={<HostCountLabelIcon />}
          idPostfix="hostcount"
          name="hostCount"
          isRequired
          minValue={HOSTS_MIN_COUNT}
          maxValue={HOSTS_MAX_COUNT}
          onChange={(newValue: number) => {
            setFieldValue('hostCount', newValue);
            if (newValue === 3) {
              setFieldValue('useMastersAsWorkers', true);
            }
          }}
        />
      </GridItem>

      <GridItem>
        <CheckboxField
          idPostfix="mastersasworkers"
          name="useMastersAsWorkers"
          label="Run workloads on control plane (master) hosts"
          isDisabled={hostCount < 5}
        />
      </GridItem>

      <GridItem>
        <ClusterWizardStepHeader>Labels</ClusterWizardStepHeader>
      </GridItem>

      <GridItem>
        <MultiSelectField
          idPostfix="locations"
          name="locations"
          label={<LocationsLabel />}
          placeholderText="Type or select location(s)"
          options={agentLocations}
          onChange={(locations) => {
            onAgentSelectorChange({
              labels: values.agentLabels,
              locations,
            });
          }}
        />
      </GridItem>

      <GridItem>
        <LabelField
          label="Labels matching hosts"
          name="agentLabels"
          idPostfix="agentlabels"
          helperText="Please provide as many labels as you can to find the relevant hosts."
          forceUniqueKeys={true}
          autocompleteValues={usedAgentLabelsWithoutLocation}
          onChange={(tags: string[]) =>
            onAgentSelectorChange({ labels: tags, locations: values.locations })
          }
          isRequired
        />
      </GridItem>
      {matchingAgents !== undefined && (
        <>
          <GridItem>
            <AlertGroup>
              <Alert
                variant={AlertVariant.success}
                title={`${matchingAgents.length} hosts (out of ${allAgentsCount}) match the requirements.`}
                isInline
              />
            </AlertGroup>
          </GridItem>

          <GridItem>
            <AgentTable
              agents={matchingAgents}
              selectedHostIds={values.selectedHostIds}
              onHostSelected={onHostSelected}
              {...hostActions}
            />
          </GridItem>
        </>
      )}
    </Grid>
  );
};

export default ClusterDeploymentHostsSelection;
