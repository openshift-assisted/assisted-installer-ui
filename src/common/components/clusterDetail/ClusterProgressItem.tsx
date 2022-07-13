import React from 'react';
import { Stack, StackItem, TextContent } from '@patternfly/react-core';
import BorderedIcon from '../ui/BorderedIcon/BorderedIcon';

const ClusterProgressItem = ({
  icon,
  children,
}: {
  icon: React.ReactElement;
  children: React.ReactNode;
}) => (
  <Stack>
    <StackItem>
      <BorderedIcon>{icon}</BorderedIcon>
    </StackItem>
    <StackItem>
      <TextContent>{children}</TextContent>
    </StackItem>
  </Stack>
);

export default ClusterProgressItem;
