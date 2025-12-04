import React from 'react';
import { TextContent, Text, Split, SplitItem } from '@patternfly/react-core';
import {
  ASSISTED_INSTALLER_DOCUMENTATION_LINK,
  TechnologyPreview,
  ExternalLink,
  isInOcm,
} from '../../../common';
import { useFeature } from '../../hooks/use-feature';

export const AssistedInstallerHeader = () => {
  const isSingleClusterFeatureEnabled = useFeature('ASSISTED_INSTALLER_SINGLE_CLUSTER_FEATURE');
  return (
    <TextContent>
      <Text component="h1" className="pf-v5-u-display-inline">
        Install OpenShift with the Assisted Installer
      </Text>
      {isSingleClusterFeatureEnabled && <TechnologyPreview />}
      <Split hasGutter>
        <SplitItem>
          <ExternalLink href={ASSISTED_INSTALLER_DOCUMENTATION_LINK}>
            Assisted Installer documentation
          </ExternalLink>
        </SplitItem>
        {isInOcm && (
          <SplitItem>
            <Text component="a" data-testid="whats-new-link">
              What's new in Assisted Installer?
            </Text>
          </SplitItem>
        )}
      </Split>
    </TextContent>
  );
};
