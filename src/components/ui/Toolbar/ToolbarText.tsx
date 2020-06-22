import React from 'react';

import { DataToolbarItem, Text } from '@patternfly/react-core';

const ToolbarText: React.FC<React.ComponentProps<typeof Text>> = (props) => (
  <DataToolbarItem>
    <Text {...props} />
  </DataToolbarItem>
);

export default ToolbarText;
