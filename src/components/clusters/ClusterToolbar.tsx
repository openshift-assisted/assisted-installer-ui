import React from 'react';
import { PageSectionVariants, DataToolbar, DataToolbarContent } from '@patternfly/react-core';
import PageSection from '../ui/PageSection';
import './ClusterToolbar.css';

interface Props {
  validationSection?: React.ReactNode;
}

const ClusterToolbar: React.FC<Props> = ({ children, validationSection }) => (
  <PageSection variant={PageSectionVariants.light} className="pf-u-box-shadow-lg-top">
    {validationSection}
    <DataToolbar id="cluster-toolbar" className="cluster-toolbar">
      <DataToolbarContent className="cluster-toolbar__content">{children}</DataToolbarContent>
    </DataToolbar>
  </PageSection>
);

export default ClusterToolbar;
