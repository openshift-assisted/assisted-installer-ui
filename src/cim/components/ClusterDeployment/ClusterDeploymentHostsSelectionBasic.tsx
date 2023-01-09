import React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';
import { CheckboxField, NumberInputField } from '../../../common';
import { HOSTS_MAX_COUNT, HOSTS_MIN_COUNT } from './constants';
import { useFormikContext } from 'formik';
import { ClusterDeploymentHostsSelectionValues } from './types';
import LocationsSelector from './LocationsSelector';
import { AgentK8sResource } from '../../types';
import AgentsSelectionHostCountAlerts from '../Agent/AgentsSelectionHostCountAlerts';
import AgentsSelectionHostCountLabelIcon from '../Agent/AgentsSelectionHostCountLabelIcon';
import { useAgentsAutoSelection } from '../Agent/AgentsSelectionUtils';
import { useTranslation } from '../../../common/hooks/use-translation-wrapper';

type ClusterDeploymentHostsSelectionBasicProps = {
  availableAgents: AgentK8sResource[];
  isSNOCluster: boolean;
};

const ClusterDeploymentHostsSelectionBasic: React.FC<ClusterDeploymentHostsSelectionBasicProps> = ({
  isSNOCluster,
  availableAgents,
}) => {
  const { setFieldValue } = useFormikContext<ClusterDeploymentHostsSelectionValues>();
  const { matchingAgents, selectedAgents, hostCount } = useAgentsAutoSelection(availableAgents);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (hostCount === 3) {
      setFieldValue('useMastersAsWorkers', true);
    }
  }, [hostCount, setFieldValue]);

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
            formatValue={(newValue) => {
              if (newValue === 4) {
                return hostCount >= 4 ? 3 : 5;
              }
              return newValue;
            }}
          />
        </GridItem>

        <GridItem>
          {/* That field is not supported ATM - (requires MGMT-7677) */}
          <CheckboxField
            idPostfix="mastersasworkers"
            name="useMastersAsWorkers"
            label={t('ai:Run workloads on control plane hosts')}
            isDisabled={hostCount < 5}
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
