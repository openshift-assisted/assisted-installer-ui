import React from 'react';
import { Text, TextContent } from '@patternfly/react-core';

const ClusterWizardStepHeader: React.FC = ({ children }) => (
  <TextContent>
    <Text component="h2">{children}</Text>
  </TextContent>
);

export default ClusterWizardStepHeader;
