import React from 'react';
import * as _ from 'lodash';
import { TextContent, Text } from '@patternfly/react-core';
import { MultiSelectField, PopoverIcon } from '../../../common';
import { AGENT_LOCATION_LABEL_KEY, AGENT_NOLOCATION_VALUE } from '../common';
import { AgentK8sResource } from '../../types';
import { MultiSelectOption } from '../../../common/components/ui/formik/types';

import './locations-selector.css';

const LocationsLabel: React.FC = () => (
  <TextContent>
    <Text component="h3">
      <div className="locations-selector__title">
        Host locations
        <PopoverIcon
          buttonClassName="locations-selector__title-icon"
          bodyContent={
            <>
              Select one or multiple locations to choose the hosts from.
              <br />
              Keep the field empty to match <b>any</b> location.
              <br />
              Set <b>{AGENT_LOCATION_LABEL_KEY}</b> label in Agent resource to specify it's
              location.
            </>
          }
        />
      </div>
    </Text>
  </TextContent>
);

const getNumOfHosts = (size: number) => {
  if (size === 0) {
    return '(no hosts available)';
  } else if (size === 1) {
    return '(1 host available)';
  }
  return `(${size} hosts available)`;
};

const LocationsSelector: React.FC<{ agents: AgentK8sResource[] }> = ({ agents }) => {
  const locations = _.countBy(
    agents,
    ({ metadata }) => metadata?.labels?.[AGENT_LOCATION_LABEL_KEY] || AGENT_NOLOCATION_VALUE,
  );

  const agentLocationOptions = Object.keys(locations).map<MultiSelectOption>((location) => ({
    // Why is that bloody prop set as mandatory in the SelectOptionProps??
    isLastOptionBeforeFooter: (index: number): boolean => index === locations.length,
    id: location,
    value: location,
    displayName: `${location === AGENT_NOLOCATION_VALUE ? 'No location' : location} ${getNumOfHosts(
      locations[location],
    )}`,
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
