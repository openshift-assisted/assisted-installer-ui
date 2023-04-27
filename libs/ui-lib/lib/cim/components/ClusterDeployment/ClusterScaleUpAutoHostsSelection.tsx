import React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { NumberInputField } from '../../../common';
import LocationsSelector from './LocationsSelector';
import { AgentK8sResource } from '../../types';
import AgentsSelectionHostCountAlerts from '../Agent/AgentsSelectionHostCountAlerts';
import AgentsSelectionHostCountLabelIcon from '../Agent/AgentsSelectionHostCountLabelIcon';
import { useAgentsAutoSelection } from '../Agent/AgentsSelectionUtils';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type ClusterScaleUpAutoHostsSelectionProps = {
  availableAgents: AgentK8sResource[];
};

const ClusterScaleUpAutoHostsSelection: React.FC<ClusterScaleUpAutoHostsSelectionProps> = ({
  availableAgents,
}) => {
  const { matchingAgents, selectedAgents, hostCount } = useAgentsAutoSelection(availableAgents);
  const { t } = useTranslation();

  return (
    <>
      <Grid hasGutter>
        <GridItem span={12} lg={10} xl={9} xl2={7}>
          <NumberInputField
            label={t('ai:Number of hosts')}
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
        selectedAgents={selectedAgents}
        targetHostCount={hostCount}
      />
    </>
  );
};

export default ClusterScaleUpAutoHostsSelection;
