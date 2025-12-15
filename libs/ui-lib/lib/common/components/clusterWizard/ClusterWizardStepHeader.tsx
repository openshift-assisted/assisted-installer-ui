import React from 'react';
import { Content } from '@patternfly/react-core';

const ClusterWizardStepHeader: React.FC = ({ children }) => (
  <Content component="h2">{children}</Content>
);

export default ClusterWizardStepHeader;
