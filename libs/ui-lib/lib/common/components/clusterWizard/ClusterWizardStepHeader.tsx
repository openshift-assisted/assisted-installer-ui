import React from 'react';
import { Content,  } from '@patternfly/react-core';

const ClusterWizardStepHeader: React.FC = ({ children }) => (
  <Content>
    <Content component="h2">{children}</Content>
  </Content>
);

export default ClusterWizardStepHeader;
