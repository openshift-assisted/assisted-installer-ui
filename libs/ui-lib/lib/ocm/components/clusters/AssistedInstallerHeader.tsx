import React from 'react';
import { TextContent, Text, Split, SplitItem } from '@patternfly/react-core';
import { ASSISTED_INSTALLER_DOCUMENTATION_LINK, ExternalLink } from '../../../common';

export const AssistedInstallerHeader = () => {
  return (
    <TextContent>
      <Text component="h1" className="pf-u-display-inline">
        Install OpenShift with the Assisted Installer
      </Text>
      <Split hasGutter>
        <SplitItem>
          <ExternalLink href={ASSISTED_INSTALLER_DOCUMENTATION_LINK}>
            Assisted Installer documentation
          </ExternalLink>
        </SplitItem>
        <SplitItem>
          <Text component="a" data-testid="whats-new-link">
            What's new in Assisted Installer?
          </Text>
        </SplitItem>
      </Split>
    </TextContent>
  );
};
