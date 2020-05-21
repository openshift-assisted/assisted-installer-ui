import React from 'react';

import { ToolbarGroup, ToolbarItem, Text } from '@patternfly/react-core';

const ToolbarText: React.FC<React.ComponentProps<typeof Text>> = (props) => (
  <ToolbarGroup>
    <ToolbarItem>
      <Text {...props} />
    </ToolbarItem>
  </ToolbarGroup>
);

export default ToolbarText;
