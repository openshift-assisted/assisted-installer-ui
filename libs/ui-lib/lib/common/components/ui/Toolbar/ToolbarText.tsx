import React from 'react';

import { ToolbarItem, Content } from '@patternfly/react-core';

const ToolbarText: React.FC<React.ComponentProps<typeof Content>> = (props) => (
  <ToolbarItem>
    <Content component="p" {...props} />
  </ToolbarItem>
);

export default ToolbarText;
