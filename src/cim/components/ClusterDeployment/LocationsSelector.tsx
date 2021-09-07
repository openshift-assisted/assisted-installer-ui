import React from 'react';
import { MultiSelectField, PopoverIcon } from '../../../common';
import { AGENT_LOCATION_LABEL_KEY, AGENT_NOLOCATION_VALUE } from '../common';
import { AgentK8sResource } from '../../types';
import { MultiSelectOption } from '../../../common/components/ui/formik/types';

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

const LocationsSelector: React.FC<{ agents: AgentK8sResource[] }> = ({ agents }) => {
  const agentLocationOptions = Array.from(
    new Set(
      agents.map(
        (agent) => agent.metadata?.labels?.[AGENT_LOCATION_LABEL_KEY] || AGENT_NOLOCATION_VALUE,
      ),
    ),
  ).map<MultiSelectOption>((value) => ({
    // Why is that bloody prop set as mandatory in the SelectOptionProps??
    isLastOptionBeforeFooter: (index: number): boolean => index === value.length,
    id: value,
    value: value,
    displayName: value === AGENT_NOLOCATION_VALUE ? 'No location' : value,
  }));

  return (
    <MultiSelectField
      idPostfix="locations"
      name="locations"
      label={<LocationsLabel />}
      placeholderText="Type or select location(s)"
      helperText="Select one or more locations to view hosts"
      options={agentLocationOptions}
    />
  );
};

export default LocationsSelector;
