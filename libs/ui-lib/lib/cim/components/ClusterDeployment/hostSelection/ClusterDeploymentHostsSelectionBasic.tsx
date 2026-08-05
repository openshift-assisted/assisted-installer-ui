import React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { NumberInputField, useTranslation } from '../../../../common';
import LocationsSelector from '../LocationsSelector';
import { AgentK8sResource } from '../../../types';
import AgentsSelectionHostCountAlerts from '../../Agent/AgentsSelectionHostCountAlerts';
import AgentsSelectionHostCountLabelIcon from '../../Agent/AgentsSelectionHostCountLabelIcon';
import { useAgentsAutoSelection } from '../../Agent/AgentsSelectionUtils';
import { HOSTS_MAX_COUNT } from '../constants';
import { ProvisionRequirements } from './utils';

type ClusterDeploymentHostsSelectionBasicProps = {
  availableAgents: AgentK8sResource[];
  isSNOCluster: boolean;
  provisionRequirements?: ProvisionRequirements;
};

export const ClusterDeploymentHostsSelectionBasic: React.FC<
  ClusterDeploymentHostsSelectionBasicProps
> = ({ isSNOCluster, availableAgents, provisionRequirements }) => {
  const { t } = useTranslation();
  const { matchingAgents, selectedAgents, hostCount } = useAgentsAutoSelection(
    availableAgents,
    provisionRequirements,
  );
  const minHosts =
    (provisionRequirements?.controlPlaneAgents || 0) + (provisionRequirements?.arbiterAgents || 0);

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
            minValue={minHosts}
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
