import React from 'react';
import { ToolbarGroup } from '@patternfly/react-core';

const ToolbarSecondaryGroup: React.FC = ({ children }) => (
  <ToolbarGroup align={{ md: 'alignRight' }}>{children}</ToolbarGroup>
);

export default ToolbarSecondaryGroup;
