import * as _ from 'lodash';
import { useFormikContext } from 'formik';
import React from 'react';
import Measure from 'react-measure';
import { Grid, GridItem } from '@patternfly/react-core';

import { AgentK8sResource } from '../../types';
import { AGENT_LOCATION_LABEL_KEY, AGENT_NOLOCATION_VALUE } from '../common';
import LocationsSelector from './LocationsSelector';
import { ClusterDeploymentHostsSelectionValues, ScaleUpFormValues } from './types';
import LabelsSelector from './LabelsSelector';
import AgentsSelectionTable from '../Agent/AgentsSelectionTable';
import { AgentTableActions } from './types';

type ClusterDeploymentHostsSelectionAdvancedProps = {
  availableAgents: AgentK8sResource[];
  onEditRole?: AgentTableActions['onEditRole'];
  onEditHost?: AgentTableActions['onEditHost'];
};

type FormValues = ClusterDeploymentHostsSelectionValues | ScaleUpFormValues;

const ClusterDeploymentHostsSelectionAdvanced = <T extends FormValues>({
  availableAgents,
  onEditRole,
  onEditHost,
}: ClusterDeploymentHostsSelectionAdvancedProps) => {
  const { values } = useFormikContext<T>();
  const { locations, agentLabels } = values;

  const matchingAgents = React.useMemo(
    () =>
      availableAgents.filter((agent) => {
        const labels = agentLabels.reduce((acc, curr) => {
          const label = curr.split('=');
          acc[label[0]] = label[1];
          return acc;
        }, {});
        const matchesLocation = locations.length
          ? locations.includes(
              agent.metadata?.labels?.[AGENT_LOCATION_LABEL_KEY] || AGENT_NOLOCATION_VALUE,
            )
          : true;
        const matchesLabels = agent.metadata?.labels
          ? _.isMatch(agent.metadata?.labels, labels)
          : true;
        return matchesLocation && matchesLabels;
      }),
    [availableAgents, locations, agentLabels],
  );

  return (
    <>
      <Grid hasGutter>
        <GridItem>
          <LocationsSelector agents={availableAgents} />
        </GridItem>
        <GridItem>
          <LabelsSelector agents={matchingAgents} />
        </GridItem>

        <GridItem>
          <Measure bounds>
            {({ measureRef, contentRect }) => (
              <div ref={measureRef}>
                <AgentsSelectionTable
                  matchingAgents={matchingAgents}
                  onEditRole={onEditRole}
                  width={contentRect.bounds?.width}
                  onEditHost={onEditHost}
                />
              </div>
            )}
          </Measure>
        </GridItem>
      </Grid>
    </>
  );
};

export default ClusterDeploymentHostsSelectionAdvanced;
