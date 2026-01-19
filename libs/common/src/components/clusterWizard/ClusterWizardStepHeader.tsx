import React from 'react';
import { Content } from '@patternfly/react-core';

const ClusterWizardStepHeader: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Content data-testid="step-header" component="h2">
    {children}
  </Content>
);

export default ClusterWizardStepHeader;
