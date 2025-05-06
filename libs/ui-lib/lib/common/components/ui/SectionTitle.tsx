import React from 'react';
import { Content, ContentVariants, GridItem } from '@patternfly/react-core';
import { WithTestID } from '../../types';

interface SectionTitleProps extends WithTestID {
  title: string;
}

const SectionTitle = ({ title, testId }: SectionTitleProps) => (
  <GridItem>
    <Content>
      <Content data-testid={testId} component={ContentVariants.h3}>
        {title}
      </Content>
    </Content>
  </GridItem>
);

export default SectionTitle;
