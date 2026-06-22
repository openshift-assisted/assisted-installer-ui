import * as React from 'react';
import { List, ListItem } from '@patternfly/react-core';
import { getYearForAssistedInstallerDocumentationLink } from '../../../../common/config/docs_links';

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
          GPUs are recommended for optimal AI/ML workload performance. Please select the GPU
          operators you want to install.
        </ListItem>
      </List>
    ),
    docsLink: `https://docs.redhat.com/en/documentation/assisted_installer_for_openshift_container_platform/${getYearForAssistedInstallerDocumentationLink()}/html/installing_openshift_container_platform_with_the_assisted_installer/customizing-with-bundles-and-operators#openshift-ai-bundle_customizing-with-bundles-and-operators`,
  },
};
