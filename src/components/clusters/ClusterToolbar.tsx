import React from 'react';
import { PageSectionVariants, ToolbarContent, Toolbar } from '@patternfly/react-core';
import PageSection from '../ui/PageSection';
import './ClusterToolbar.css';
import { ocmClient } from '../../api';

interface Props {
  validationSection?: React.ReactNode;
}

const ClusterToolbar: React.FC<Props> = ({ children, validationSection }) => {
  let toolBarClassname = 'cluster-toolbar';
  if (ocmClient) {
    toolBarClassname += ' cluster-toolbar-ocm';
  }

  return (
    <PageSection
      variant={PageSectionVariants.light}
      // className="pf-u-box-shadow-lg-top"
      padding={{ default: 'padding' }}
    >
      {validationSection}
      <Toolbar id="cluster-toolbar" className={toolBarClassname}>
        <ToolbarContent className="cluster-toolbar__content">{children}</ToolbarContent>
      </Toolbar>
    </PageSection>
  );
};

export default ClusterToolbar;
