import React from 'react';
import { PageSectionVariants, Toolbar } from '@patternfly/react-core';

import PageSection from '../ui/PageSection';

interface Props {
  children: React.ReactNode;
}

const ClusterToolbar: React.FC<Props> = ({ children }) => (
  <PageSection variant={PageSectionVariants.light} className="pf-u-box-shadow-lg-top">
    <Toolbar>{children}</Toolbar>
  </PageSection>
);

export default ClusterToolbar;
