import React from 'react';
import { Stack, StackItem, Content } from '@patternfly/react-core';
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
      <Content>{children}</Content>
    </StackItem>
  </Stack>
);

export default ClusterProgressItem;
