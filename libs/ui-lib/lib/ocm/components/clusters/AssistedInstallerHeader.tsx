import React from 'react';
import { Content, Split, SplitItem } from '@patternfly/react-core';
import { ASSISTED_INSTALLER_DOCUMENTATION_LINK, ExternalLink, isInOcm } from '../../../common';

export const AssistedInstallerHeader = () => {
  return (
    <Content>
      <Content component="h1" className="pf-v5-u-display-inline">
        Install OpenShift with the Assisted Installer
      </Content>
      <Split hasGutter>
        <SplitItem>
          <ExternalLink href={ASSISTED_INSTALLER_DOCUMENTATION_LINK}>
            Assisted Installer documentation
          </ExternalLink>
        </SplitItem>
        {isInOcm && (
          <SplitItem>
            <Content component="a" data-testid="whats-new-link">
              What's new in Assisted Installer?
            </Content>
          </SplitItem>
        )}
      </Split>
    </Content>
  );
};
