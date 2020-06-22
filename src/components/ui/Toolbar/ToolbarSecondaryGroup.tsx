import React from 'react';
import { DataToolbarGroup } from '@patternfly/react-core';

const ToolbarSecondaryGroup: React.FC = ({ children }) => (
  <DataToolbarGroup breakpointMods={[{ modifier: 'align-right', breakpoint: 'md' }]}>
    {children}
  </DataToolbarGroup>
);

export default ToolbarSecondaryGroup;
