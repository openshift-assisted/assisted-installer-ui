import * as _ from 'lodash';
import { useFormikContext } from 'formik';
import React from 'react';
import { AgentK8sResource, ClusterDeploymentK8sResource } from '../../types';
import { AGENT_LOCATION_LABEL_KEY, AGENT_NOLOCATION_VALUE } from '../common';
import LocationsSelector from './LocationsSelector';
import { ClusterDeploymentHostsSelectionValues, ScaleUpFormValues } from './types';
import LabelsSelector from './LabelsSelector';
import AgentsSelectionTable from '../Agent/AgentsSelectionTable';
import {
  Button,
  ButtonVariant,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { ClusterDeploymentHostsTablePropsActions } from './types';

type ClusterDeploymentHostsSelectionAdvancedProps = {
  clusterDeployment: ClusterDeploymentK8sResource;
  availableAgents: AgentK8sResource[];
  hostActions?: ClusterDeploymentHostsTablePropsActions;
};

type FormValues = ClusterDeploymentHostsSelectionValues | ScaleUpFormValues;

const ClusterDeploymentHostsSelectionAdvanced = <T extends FormValues>({
  clusterDeployment,
  availableAgents,
  hostActions,
}: ClusterDeploymentHostsSelectionAdvancedProps) => {
  const { values, isValid, isSubmitting, submitForm, errors, initialValues } = useFormikContext<
    T
  >();
  const { selectedHostIds, locations, agentLabels } = values;

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

  const agentsToUnbind = availableAgents.filter(
    (a) =>
      !selectedHostIds.includes(a.metadata?.uid ?? '') &&
      a.spec?.clusterDeploymentName?.name === clusterDeployment.metadata?.name &&
      a.spec?.clusterDeploymentName?.namespace === clusterDeployment.metadata?.namespace,
  );

  const isSelectedHostIdsDirty = !!_.xor(selectedHostIds, initialValues.selectedHostIds).length;
  const isUnbindingAllHosts = isSelectedHostIdsDirty && selectedHostIds.length === 0;

  const getSelectedHostIdsHelperText = React.useCallback(() => {
    if (selectedHostIds.length && agentsToUnbind.length) {
      return `${selectedHostIds.length} hosts will be bound to the cluster, ${agentsToUnbind.length} will be removed.`;
    }
    if (selectedHostIds.length && !agentsToUnbind.length) {
      return `${selectedHostIds.length} hosts will be bound to the cluster.`;
    }
    if (!selectedHostIds.length && agentsToUnbind.length) {
      return `${agentsToUnbind.length} hosts will be removed from the cluster.`;
    }
  }, [selectedHostIds.length, agentsToUnbind.length]);

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
          <Toolbar data-testid="agents-selection-table-toolbar" inset={{ default: 'insetNone' }}>
            <ToolbarContent>
              <ToolbarItem>
                <Button
                  variant={ButtonVariant.secondary}
                  isDisabled={!isValid || isSubmitting || !isSelectedHostIdsDirty}
                  onClick={submitForm}
                  isSmall
                >
                  {isUnbindingAllHosts ? 'Unbind hosts' : 'Bind hosts'}
                </Button>
              </ToolbarItem>
              <ToolbarItem>
                <HelperText component="ul">
                  {errors.selectedHostIds ? (
                    <HelperTextItem variant="error" hasIcon>
                      {errors.selectedHostIds}
                    </HelperTextItem>
                  ) : (
                    isSelectedHostIdsDirty && (
                      <HelperTextItem>{getSelectedHostIdsHelperText()}</HelperTextItem>
                    )
                  )}
                </HelperText>
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          <AgentsSelectionTable
            matchingAgents={matchingAgents}
            onEditRole={hostActions?.onEditRole}
          />
        </GridItem>
      </Grid>
    </>
  );
};

export default ClusterDeploymentHostsSelectionAdvanced;
