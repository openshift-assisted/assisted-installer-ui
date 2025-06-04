import React from 'react';
import { Content, Split, SplitItem } from '@patternfly/react-core';
import {
  ASSISTED_INSTALLER_DOCUMENTATION_LINK,
  DeveloperPreview,
  ExternalLink,
  isInOcm,
} from '../../../common';
import { useFeature } from '../../hooks/use-feature';

export const AssistedInstallerHeader = () => {
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  return (
    <Content>
      <Content component="h1" className="pf-v6-u-display-inline">
        Install OpenShift with the Assisted Installer
      </Content>
      {isSingleClusterFeatureEnabled && <DeveloperPreview />}
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
