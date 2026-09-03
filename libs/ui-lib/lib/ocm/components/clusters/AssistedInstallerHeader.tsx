import React from 'react';
import { Content, Split, SplitItem } from '@patternfly/react-core';
import {
  ASSISTED_INSTALLER_DOCUMENTATION_LINK,
  ExternalLink,
  isInOcm,
} from '../../../common';

type AssistedInstallerHeaderProps = {
  clusterName?: string;
};

export const AssistedInstallerHeader = ({ clusterName }: AssistedInstallerHeaderProps) => {
  return (
    <>
      <Content component="h1" className="pf-v6-u-display-inline">
        {clusterName || 'Install OpenShift with the Assisted Installer'}
      </Content>
      <Split hasGutter>
        <SplitItem>
          <ExternalLink href={ASSISTED_INSTALLER_DOCUMENTATION_LINK}>
            Assisted Installer documentation
          </ExternalLink>
        </SplitItem>
        {isInOcm && (
          <SplitItem>
            <Content component="a" data-testid="whats-new-link" hidden={true}>
              What's new in Assisted Installer?
            </Content>
          </SplitItem>
        )}
      </Split>
    </>
  );
};
