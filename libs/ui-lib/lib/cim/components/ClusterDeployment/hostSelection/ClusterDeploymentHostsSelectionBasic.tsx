import React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { NumberInputField } from '../../../../common';
import { HOSTS_MAX_COUNT, HOSTS_MIN_COUNT } from '../constants';
import LocationsSelector from '../LocationsSelector';
import { AgentK8sResource } from '../../../types';
import AgentsSelectionHostCountAlerts from '../../Agent/AgentsSelectionHostCountAlerts';
import AgentsSelectionHostCountLabelIcon from '../../Agent/AgentsSelectionHostCountLabelIcon';
import { useAgentsAutoSelection } from '../../Agent/AgentsSelectionUtils';
import { useTranslation } from '../../../../common/hooks/use-translation-wrapper';

type ClusterDeploymentHostsSelectionBasicProps = {
  availableAgents: AgentK8sResource[];
  isSNOCluster: boolean;
};

const ClusterDeploymentHostsSelectionBasic: React.FC<ClusterDeploymentHostsSelectionBasicProps> = ({
  isSNOCluster,
  availableAgents,
}) => {
  const { matchingAgents, selectedAgents, hostCount } = useAgentsAutoSelection(availableAgents);
  const { t } = useTranslation();

  return (
    <>
      <Grid hasGutter>
        <GridItem>
          <NumberInputField
            label={t('ai:Number of hosts')}
            labelIcon={<AgentsSelectionHostCountLabelIcon />}
            idPostfix="hostcount"
            name="hostCount"
            isRequired
            minValue={isSNOCluster ? 1 : HOSTS_MIN_COUNT}
            maxValue={isSNOCluster ? 1 : HOSTS_MAX_COUNT}
            isDisabled={isSNOCluster}
          />
        </GridItem>

        <GridItem>
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

export default ClusterDeploymentHostsSelectionBasic;
