import React from 'react';

import { Button, ToolbarItem } from '@patternfly/react-core';

const ToolbarButton: React.FC<React.ComponentProps<typeof Button> & { isHidden?: boolean }> = ({
  isHidden = false,
  ...props
}) =>
  isHidden ? null : (
    <ToolbarItem>
      <Button {...props} />
    </ToolbarItem>
  );

export default ToolbarButton;
