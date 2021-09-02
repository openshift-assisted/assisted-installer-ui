import React from 'react';
import { Alert, AlertGroup, AlertVariant, GridItem } from '@patternfly/react-core';
import { CheckboxField, NumberInputField } from '../../../common';
import { HOSTS_MAX_COUNT, HOSTS_MIN_COUNT } from './constants';
import { useFormikContext } from 'formik';
import {
  ClusterDeploymentHostsSelectionProps,
  ClusterDeploymentHostsSelectionValues,
} from './types';
import LocationsSelector from './LocationsSelector';
import ShortCapacitySummary from './ShortCapacitySummary';

// TODO(mlibra): Something more descriptive
const HostCountLabelIcon: React.FC = () => <>Total count of hosts to be included in the cluster.</>;

type ClusterDeploymentHostsSelectionBasicProps = Pick<
  ClusterDeploymentHostsSelectionProps,
  'agentLocations' | 'onAgentSelectorChange' | 'matchingAgents'
>;

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
  agentLocations,
  onAgentSelectorChange,
  matchingAgents,
}) => {
  const { setFieldValue, values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();
  const { hostCount, isSNOCluster } = values;

  // Take first n from top
  const selectedAgents = (matchingAgents || []).slice(0, hostCount);
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
          onChange={(newValue: number) => {
            // Never called in the SNO flow

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
        <LocationsSelector
          agentLocations={agentLocations}
          onAgentSelectorChange={onAgentSelectorChange}
        />
      </GridItem>

      {selectedAgents.length === hostCount && (
        <>
          <GridItem>
            <AlertGroup>
              <Alert
                variant={AlertVariant.success}
                title={`${selectedAgents.length} hosts selected out of ${matchingAgents?.length} matching.`}
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
