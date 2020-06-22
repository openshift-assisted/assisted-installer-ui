import React from 'react';

import { Button, DataToolbarItem } from '@patternfly/react-core';

const ToolbarButton: React.FC<React.ComponentProps<typeof Button>> = (props) => (
  <DataToolbarItem>
    <Button {...props} />
  </DataToolbarItem>
);

export default ToolbarButton;
