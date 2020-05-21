import React from 'react';
import PageSection from '../PageSection';
import { AlertGroup } from '@patternfly/react-core';

import './AlertsSection.css';

const AlertsSection: React.FC = ({ children }) => (
  <PageSection noPadding>
    <AlertGroup className="alerts-section">{children}</AlertGroup>
  </PageSection>
);

export default AlertsSection;
