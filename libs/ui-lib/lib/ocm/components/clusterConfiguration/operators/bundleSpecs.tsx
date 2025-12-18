import * as React from 'react';
import { List, ListItem } from '@patternfly/react-core';

export type BundleSpec = {
  incompatibleBundles?: string[];
  Description: React.ComponentType;
  docsLink?: string;
};

export const bundleSpecs: { [key: string]: BundleSpec } = {
  virtualization: {
    Description: () => (
      <List>
        <ListItem>
          Enabled CPU virtualization support in BIOS (Intel-VT / AMD-V) on all nodes.
        </ListItem>
        <ListItem>
          Each control plane node requires an additional 1024 MiB of memory and 3 CPU cores.
        </ListItem>
        <ListItem>
          Each worker node requires an additional 1024 MiB of memory and 5 CPU cores.
        </ListItem>
        <ListItem>
          Additional resources may be required to support the selected storage operator.
        </ListItem>
      </List>
    ),
  },
  'openshift-ai': {
    incompatibleBundles: [],
    Description: () => (
      <List>
        <ListItem>
          NVIDIA GPU, AMD GPU and Kernel Module Management may or may not be installed based on the
          GPU discovered on your hosts.
        </ListItem>
      </List>
    ),
  },
};
