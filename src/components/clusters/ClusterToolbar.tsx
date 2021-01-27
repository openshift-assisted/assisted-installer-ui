import React from 'react';
import { ToolbarContent, Toolbar, ActionGroup } from '@patternfly/react-core';
import { ocmClient } from '../../api';
import './ClusterToolbar.css';

interface Props {
  validationSection?: React.ReactNode;
}

const ClusterToolbar: React.FC<Props> = ({ children, validationSection }) => {
  let toolBarClassname = 'cluster-toolbar';
  if (ocmClient) {
    toolBarClassname += ' cluster-toolbar-ocm';
  }

  return (
    <ActionGroup>
      {validationSection}
      <Toolbar id="cluster-toolbar" className={toolBarClassname}>
        <ToolbarContent className="cluster-toolbar__content">{children}</ToolbarContent>
      </Toolbar>
    </ActionGroup>
  );
};

export default ClusterToolbar;
