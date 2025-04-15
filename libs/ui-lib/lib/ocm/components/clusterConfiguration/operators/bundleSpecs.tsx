import * as React from 'react';
import { List, ListItem } from '@patternfly/react-core';
import { FeatureId, OPENSHIFT_AI_REQUIREMENTS_LINK } from '../../../../common';

export type BundleSpec = {
  featureId?: FeatureId;
  noSNO?: boolean;
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
          Each control plane node requires an additional 1024 MiB of memory and 3 CPUs.
        </ListItem>
        <ListItem>Each worker node requires an additional 1024 MiB of memory and 5 CPUs.</ListItem>
        <ListItem>
          Additional resources may be required to support the selected storage operator.
        </ListItem>
      </List>
    ),
  },
  'openshift-ai-nvidia': {
    featureId: 'OPENSHIFT_AI',
    noSNO: true,
    incompatibleBundles: ['openshift-ai-amd'],
    Description: () => (
      <List>
        <ListItem>At least two worker nodes.</ListItem>
        <ListItem>
          Each worker node requires 32 additional GiB of memory and 8 additional CPUs.
        </ListItem>
        <ListItem>At least one supported NVIDIA GPU.</ListItem>
        <ListItem>
          Nodes that have NVIDIA GPUs installed need to have secure boot disabled.
        </ListItem>
      </List>
    ),
    docsLink: OPENSHIFT_AI_REQUIREMENTS_LINK,
  },
  'openshift-ai-amd': {
    featureId: 'OPENSHIFT_AI',
    noSNO: true,
    incompatibleBundles: ['openshift-ai-nvidia'],
    Description: () => (
      <List>
        <ListItem>At least two worker nodes.</ListItem>
        <ListItem>
          Each worker node requires 32 additional GiB of memory and 8 additional CPUs.
        </ListItem>
        <ListItem>At least one supported AMD GPU.</ListItem>
        <ListItem>Nodes that have AMD GPUs installed need to have secure boot disabled.</ListItem>
      </List>
    ),
    docsLink: OPENSHIFT_AI_REQUIREMENTS_LINK,
  },
};
