import React from 'react';
import { ToolbarGroup } from '@patternfly/react-core';

const ToolbarSecondaryGroup: React.FC = ({ children }) => (
  <ToolbarGroup align={{ md: "alignEnd" }}>{children}</ToolbarGroup>
);

export default ToolbarSecondaryGroup;
