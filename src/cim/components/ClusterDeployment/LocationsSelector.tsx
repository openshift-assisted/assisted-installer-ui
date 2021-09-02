import React from 'react';
import { useFormikContext } from 'formik';
import { MultiSelectField, PopoverIcon } from '../../../common';
import { AGENT_LOCATION_LABEL_KEY } from '../common';
import {
  AgentLocation,
  ClusterDeploymentHostsSelectionProps,
  ClusterDeploymentHostsSelectionValues,
} from './types';

const LocationsLabel: React.FC = () => (
  <>
    Host locations{' '}
    <PopoverIcon
      bodyContent={
        <>
          Select one or multiple locations to choose the hosts from.
          <br />
          Keep the field empty to match <b>any</b> location.
          <br />
          Set <b>{AGENT_LOCATION_LABEL_KEY}</b> label in Agent resource to specify it's location.
        </>
      }
    />
  </>
);

type LocationsSelectorProps = Pick<
  ClusterDeploymentHostsSelectionProps,
  'agentLocations' | 'onAgentSelectorChange'
>;

const LocationsSelector: React.FC<LocationsSelectorProps> = ({
  agentLocations = [],
  onAgentSelectorChange,
}) => {
  const { values } = useFormikContext<ClusterDeploymentHostsSelectionValues>();

  const agentLocationOptions = agentLocations.map((loc: AgentLocation) => ({
    // Why is that bloody prop set as mandatory in the SelectOptionProps??
    isLastOptionBeforeFooter: (index: number): boolean => index === agentLocations.length,
    id: loc.value,
    ...loc,
  }));

  return (
    <MultiSelectField
      idPostfix="locations"
      name="locations"
      label={<LocationsLabel />}
      placeholderText="Type or select location(s)"
      helperText="Select one or more locations to view hosts"
      options={agentLocationOptions}
      onChange={(locations) => {
        onAgentSelectorChange({
          labels: values.agentLabels,
          locations,
        });
      }}
    />
  );
};

export default LocationsSelector;
