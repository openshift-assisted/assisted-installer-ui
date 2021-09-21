import React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { NumberInputField } from '../../../common';
import LocationsSelector from './LocationsSelector';
import ShortCapacitySummary from './ShortCapacitySummary';
import { AgentK8sResource } from '../../types';
import AgentsSelectionHostCountAlerts from '../Agent/AgentsSelectionHostCountAlerts';
import AgentsSelectionHostCountLabelIcon from '../Agent/AgentsSelectionHostCountLabelIcon';
import { useAgentsAutoSelection } from '../Agent/AgentsSelectionUtils';

type ClusterScaleUpAutoHostsSelectionProps = {
  availableAgents: AgentK8sResource[];
};

const ClusterScaleUpAutoHostsSelection: React.FC<ClusterScaleUpAutoHostsSelectionProps> = ({
  availableAgents,
}) => {
  const { matchingAgents, selectedAgents, hostCount } = useAgentsAutoSelection(availableAgents);

  return (
    <>
      <Grid hasGutter>
        <GridItem span={12} lg={10} xl={9} xl2={7}>
          <NumberInputField
            label="Number of hosts"
            labelIcon={<AgentsSelectionHostCountLabelIcon />}
            idPostfix="hostcount"
            name="hostCount"
            minValue={1}
            maxValue={matchingAgents.length}
            isRequired
          />
        </GridItem>
        <GridItem span={12} lg={10} xl={9} xl2={7}>
          <LocationsSelector agents={availableAgents} />
        </GridItem>
      </Grid>

      <AgentsSelectionHostCountAlerts
        matchingAgentsCount={matchingAgents.length}
        selectedAgentsCount={selectedAgents.length}
        targetHostCount={hostCount}
      />

      <ShortCapacitySummary selectedAgents={selectedAgents} />
    </>
  );
};

export default ClusterScaleUpAutoHostsSelection;
