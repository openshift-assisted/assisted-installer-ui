import React from 'react';
import { useFormikContext } from 'formik';
import {
  Grid,
  GridItem,
  AlertGroup,
  Alert,
  AlertVariant,
  TextContent,
  Text,
} from '@patternfly/react-core';
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
  matchingMastersCount,
  matchingWorkersCount,
  onMasterAgentSelectorChange,
  onWorkerAgentSelectorChange,
}) => {
  const { setFieldValue, values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();
  const { hostCount, autoSelectMasters } = values;

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
              onChange={(newVal: boolean) => {
                if (newVal) {
                  onWorkerAgentSelectorChange(undefined);
                  setFieldValue('workerLabels', []);
                  // TODO(mlibra): tweak for proper error alerts
                }
              }}
            />
          }
        >
          Labels
        </ClusterWizardStepHeader>
      </GridItem>

      <GridItem>
        {!autoSelectMasters && (
          <TextContent>
            <Text component="h3">Control plane (master) hosts</Text>
          </TextContent>
        )}
        <LabelField
          label={
            autoSelectMasters
              ? 'Labels matching hosts'
              : 'Labels matching control plane (master) hosts'
          }
          name="masterLabels"
          idPostfix="masterlabels"
          helperText="Please provide as many labels as you can to find the relevant hosts."
          forceUniqueKeys={true}
          autocompleteValues={usedAgentlabels}
          onChange={(tags: string[]) => onMasterAgentSelectorChange(tags)}
          isRequired
        />
      </GridItem>
      {matchingMastersCount !== undefined && (
        <GridItem>
          <AlertGroup>
            <Alert
              variant={AlertVariant.success}
              title={`${matchingMastersCount} hosts (out of XYZ) match the requirements.`}
              isInline
            />
          </AlertGroup>
        </GridItem>
      )}

      {!autoSelectMasters && (
        <>
          <GridItem>
            <TextContent>
              <Text component="h3">Worker hosts</Text>
            </TextContent>

            <LabelField
              label="Labels matching worker hosts"
              name="workerLabels"
              idPostfix="workerlabels"
              helperText="Please provide as many labels as you can to find the relevant hosts."
              forceUniqueKeys={true}
              autocompleteValues={usedAgentlabels}
              onChange={(tags: string[]) => onWorkerAgentSelectorChange(tags)}
              isRequired
            />
          </GridItem>
          {matchingWorkersCount !== undefined && (
            <GridItem>
              <AlertGroup>
                <Alert
                  variant={AlertVariant.success}
                  title={`${matchingWorkersCount} hosts (out of XYZ) match the requirements.`}
                  isInline
                />
              </AlertGroup>
            </GridItem>
          )}
        </>
      )}
    </Grid>
  );
};

export default ClusterDeploymentHostsSelection;
