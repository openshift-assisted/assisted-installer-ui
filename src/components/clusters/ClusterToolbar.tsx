import React from 'react';
import { PageSectionVariants, ToolbarContent, Toolbar } from '@patternfly/react-core';
import PageSection from '../ui/PageSection';
import './ClusterToolbar.css';

interface Props {
  validationSection?: React.ReactNode;
}

const ClusterToolbar: React.FC<Props> = ({ children, validationSection }) => (
  <PageSection variant={PageSectionVariants.light} className="pf-u-box-shadow-lg-top">
    {validationSection}
    <Toolbar id="cluster-toolbar" className="cluster-toolbar">
      <ToolbarContent className="cluster-toolbar__content">{children}</ToolbarContent>
    </Toolbar>
  </PageSection>
);

export default ClusterToolbar;
