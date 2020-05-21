import React from 'react';

import { ToolbarGroup, ToolbarItem, Button } from '@patternfly/react-core';

const ToolbarButton: React.FC<React.ComponentProps<typeof Button>> = (props) => (
  <ToolbarGroup>
    <ToolbarItem>
      <Button {...props} />
    </ToolbarItem>
  </ToolbarGroup>
);

export default ToolbarButton;
