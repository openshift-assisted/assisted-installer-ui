import * as React from 'react';
import { List, ListItem } from '@patternfly/react-core';

export type BundleSpec = {
  noSNO?: boolean;
  incompatibleBundles?: string[];
  Description: React.ComponentType;
  docsLink?: string;
};

export const bundleSpecs: { [key: string]: BundleSpec } = {
  virtualization: {
    noSNO: true,
    Description: () => (
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
    ),
  },
  'openshift-ai': {
    noSNO: true,
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
