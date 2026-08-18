import React from 'react';
import { Content, ContentVariants, GridItem } from '@patternfly/react-core';
import { WithTestID } from '../../types';

interface SectionTitleProps extends WithTestID {
  title: string;
}

export const SectionTitle = ({ title, testId }: SectionTitleProps) => (
  <GridItem>
    <Content data-testid={testId} component={ContentVariants.h3}>
      {title}
    </Content>
  </GridItem>
);
