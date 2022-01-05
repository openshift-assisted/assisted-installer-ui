import React from 'react';
import { TextListItem, OrderType, Text, TextContent, TextList } from '@patternfly/react-core';

const DiscoveryInstructions = ({
  showAllInstructions = false,
}: {
  showAllInstructions?: boolean;
}) => (
  <TextContent>
    <Text component="h3">Adding hosts instructions</Text>
    <TextList component="ol" type={OrderType.number} style={{ marginLeft: 0 }}>
      <TextListItem hidden={!showAllInstructions}>Click the Add hosts button.</TextListItem>
      <TextListItem hidden={!showAllInstructions}>
        Configure the SSH key and proxy settings after the modal appears (optional).
      </TextListItem>
      <TextListItem>
        Download the Discovery ISO and save it on a bootable device (local disk, USB drive, etc.).
      </TextListItem>
      <TextListItem>
        Set each host to boot <b>only one time</b> from this device.
      </TextListItem>
      <TextListItem>Discovered hosts will appear in the table.</TextListItem>
    </TextList>
  </TextContent>
);

export default DiscoveryInstructions;
