import React from 'react';
import * as _ from 'lodash';
import { Alert, AlertGroup, AlertVariant, GridItem } from '@patternfly/react-core';
import { CheckboxField, NumberInputField } from '../../../common';
import { HOSTS_MAX_COUNT, HOSTS_MIN_COUNT } from './constants';
import { useFormikContext } from 'formik';
import { ClusterDeploymentHostsSelectionValues } from './types';
import LocationsSelector from './LocationsSelector';
import ShortCapacitySummary from './ShortCapacitySummary';
import { AgentK8sResource } from '../../types';
import { AGENT_LOCATION_LABEL_KEY, AGENT_NOLOCATION_VALUE } from '../common';

const HostCountLabelIcon: React.FC = () => <>Total count of hosts to be included in the cluster.</>;

type ClusterDeploymentHostsSelectionBasicProps = {
  availableAgents: AgentK8sResource[];
  isSNOCluster: boolean;
};

const getHostCountWarningText = (hostsSelected: number) => {
  switch (hostsSelected) {
    case 0:
      return 'No host is selected.';
    case 1:
      return 'Only 1 host is selected.';
  }
  return `Only ${hostsSelected} hosts are selected.`;
};

const ClusterDeploymentHostsSelectionBasic: React.FC<ClusterDeploymentHostsSelectionBasicProps> = ({
  isSNOCluster,
  availableAgents,
}) => {
  const { setFieldValue, values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();
  const { hostCount, locations, autoSelectedHostIds } = values;
  const [matchingAgents, selectedAgents] = React.useMemo(() => {
    const mAgents = availableAgents.filter((agent) => {
      const agentLocation =
        agent.metadata?.annotations?.[AGENT_LOCATION_LABEL_KEY] || AGENT_NOLOCATION_VALUE;
      return locations.length ? locations.includes(agentLocation) : true;
    });
    const sAgents = mAgents.filter((a) => autoSelectedHostIds.includes(a.metadata?.uid || ''));
    if (sAgents.length !== autoSelectedHostIds.length) {
      const freeAgents = mAgents.filter((a) => a.metadata?.uid);
      sAgents.push(...freeAgents.splice(0, hostCount));
    }
    return [mAgents, sAgents];
  }, [availableAgents, locations, autoSelectedHostIds, hostCount]);

  React.useEffect(() => {
    const ids = matchingAgents.map((a) => a.metadata?.uid);
    if (!_.isEqual(ids, autoSelectedHostIds)) {
      setFieldValue('autoSelectedHostIds', ids.splice(0, hostCount));
    }
  }, [matchingAgents, setFieldValue, autoSelectedHostIds, hostCount]);

  return (
    <>
      <GridItem span={12} lg={10} xl={9} xl2={7}>
        <NumberInputField
          labelIcon={<HostCountLabelIcon />}
          idPostfix="hostcount"
          name="hostCount"
          isRequired
          minValue={isSNOCluster ? 1 : HOSTS_MIN_COUNT}
          maxValue={isSNOCluster ? 1 : HOSTS_MAX_COUNT}
          isDisabled={isSNOCluster}
          onChange={(newValue) => {
            if (newValue === 4) {
              newValue = values.hostCount >= 4 ? 3 : 5;
            }
            setFieldValue('hostCount', newValue);
            if (newValue === 3) {
              setFieldValue('useMastersAsWorkers', true);
            }
          }}
        />
      </GridItem>

      {/* That field is not supported ATM - (requires MGMT-7677) */}
      <GridItem>
        <CheckboxField
          idPostfix="mastersasworkers"
          name="useMastersAsWorkers"
          label="Run workloads on control plane (master) hosts"
          isDisabled={hostCount < 5}
        />
      </GridItem>

      <GridItem>
        <LocationsSelector agents={availableAgents} />
      </GridItem>

      {selectedAgents.length === hostCount && (
        <>
          <GridItem>
            <AlertGroup>
              <Alert
                variant={AlertVariant.success}
                title={`${selectedAgents.length} hosts selected out of ${matchingAgents.length} matching.`}
                isInline
              />
            </AlertGroup>
          </GridItem>
        </>
      )}

      {selectedAgents.length < hostCount && (
        <>
          <GridItem>
            <AlertGroup>
              <Alert
                variant={AlertVariant.warning}
                title={getHostCountWarningText(selectedAgents.length)}
                isInline
              />
            </AlertGroup>
          </GridItem>
        </>
      )}

      <GridItem>
        <ShortCapacitySummary selectedAgents={selectedAgents} />
      </GridItem>
    </>
  );
};

export default ClusterDeploymentHostsSelectionBasic;
