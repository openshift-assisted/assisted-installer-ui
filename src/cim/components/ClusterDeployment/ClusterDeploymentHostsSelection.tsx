import React from 'react';
import { useFormikContext } from 'formik';
import { Grid, GridItem } from '@patternfly/react-core';
import {
  CheckboxField,
  ClusterWizardStepHeader,
  LabelField,
  NumberInputField,
  PopoverIcon,
  SwitchField,
} from '../../../common';
import {
  ClusterDeploymentHostsSelectionProps,
  ClusterDeploymentHostsSelectionValues,
} from './types';
import { HOSTS_MAX_COUNT, HOSTS_MIN_COUNT } from './constants';

// TODO(mlibra): Something more descriptive
const HostCountLabelIcon: React.FC = () => <>Total count of hosts included in the cluster.</>;

const AutoSelectMastersLabel: React.FC = () => (
  <>
    Auto-select control plane (master) hosts.{' '}
    <PopoverIcon bodyContent="Allowing to auto allocate control plane (master) hosts based on the matched labels." />
  </>
);

// TODO(mlibra): implement for Single Node Cluster as well
const ClusterDeploymentHostsSelection: React.FC<ClusterDeploymentHostsSelectionProps> = ({
  usedAgentlabels,
}) => {
  const { setFieldValue, values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();
  const { hostCount } = values;

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
        <ClusterWizardStepHeader
          extraItems={
            <SwitchField
              name="autoSelectMasters"
              idPostfix="autoselectmasters"
              label={<AutoSelectMastersLabel />}
            />
          }
        >
          Labels
        </ClusterWizardStepHeader>
      </GridItem>
      <GridItem>
        <LabelField
          label="Labels matching hosts"
          name="labels"
          idPostfix="labels"
          helperText="Please provide as many labels as you can to find the relevant hosts."
          forceUniqueKeys={true}
          autocompleteValues={usedAgentlabels}
          isRequired
        />
      </GridItem>
    </Grid>
  );
};

export default ClusterDeploymentHostsSelection;
