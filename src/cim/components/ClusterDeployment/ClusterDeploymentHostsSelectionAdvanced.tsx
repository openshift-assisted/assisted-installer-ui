import * as _ from 'lodash';
import { useFormikContext } from 'formik';
import React from 'react';
import { AgentK8sResource } from '../../types';
import { AGENT_LOCATION_LABEL_KEY, AGENT_NOLOCATION_VALUE } from '../common';
import LocationsSelector from './LocationsSelector';
import { ClusterDeploymentHostsSelectionValues, ScaleUpFormValues } from './types';
import LabelsSelector from './LabelsSelector';
import AgentsSelectionTable from '../Agent/AgentsSelectionTable';
import { Grid, GridItem } from '@patternfly/react-core';

type ClusterDeploymentHostsSelectionAdvancedProps = {
  availableAgents: AgentK8sResource[];
};

type FormValues = ClusterDeploymentHostsSelectionValues | ScaleUpFormValues;

const ClusterDeploymentHostsSelectionAdvanced = <T extends FormValues>({
  availableAgents,
}: ClusterDeploymentHostsSelectionAdvancedProps) => {
  const { values } = useFormikContext<T>();

  const matchingAgents = React.useMemo(() => {
    return availableAgents.filter((agent) => {
      const labels = values.agentLabels.reduce((acc, curr) => {
        const label = curr.split('=');
        acc[label[0]] = label[1];
        return acc;
      }, {});
      const matchesLocation = values.locations.length
        ? values.locations.includes(
            agent.metadata?.labels?.[AGENT_LOCATION_LABEL_KEY] || AGENT_NOLOCATION_VALUE,
          )
        : true;
      const matchesLabels = agent.metadata?.labels
        ? _.isMatch(agent.metadata?.labels, labels)
        : true;
      return matchesLocation && matchesLabels;
    });
  }, [availableAgents, values.locations, values.agentLabels]);

  return (
    <>
      <Grid hasGutter>
        <GridItem>
          <LocationsSelector agents={availableAgents} />
        </GridItem>
        <GridItem>
          <LabelsSelector agents={matchingAgents} />
        </GridItem>
      </Grid>
      <AgentsSelectionTable matchingAgents={matchingAgents} />
    </>
  );
};

export default ClusterDeploymentHostsSelectionAdvanced;
