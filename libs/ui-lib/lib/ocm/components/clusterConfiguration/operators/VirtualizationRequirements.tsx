import React from 'react';
import { List, ListItem } from '@patternfly/react-core';

const VirtualizationRequirements = () => {
  return (
    <>
      <List>
        <ListItem>
          Enabled CPU virtualization support in BIOS (Intel-VT / AMD-V) on all nodes.
        </ListItem>
        <ListItem>
          Each control plane node requires an additional 1024 MiB of memory and 3 CPUs.
        </ListItem>
        <ListItem>Each worker node requires an additional 1024 MiB of memory and 5 CPUs.</ListItem>
        <ListItem>
          Additional resources may be required to support the selected storage operator.
        </ListItem>
      </List>
      Bundle operators:
      <List>
        <ListItem>OpenShift Virtualization</ListItem>
        <ListItem>Migration Toolkit for Virtualization</ListItem>
        <ListItem>Nmstate</ListItem>
        <ListItem>Storage operator (either LSO/LVMS)</ListItem>
      </List>
    </>
  );
};

export default VirtualizationRequirements;
