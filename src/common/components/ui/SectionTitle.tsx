import React from 'react';
import { TextContent, Text, TextVariants, GridItem } from '@patternfly/react-core';
import { WithTestID } from '../../types';

interface SectionTitleProps extends WithTestID {
  title: string;
}

const SectionTitle = ({ title, testId }: SectionTitleProps) => (
  <GridItem>
    <TextContent>
      <Text data-testid={testId} component={TextVariants.h3}>
        {title}
      </Text>
    </TextContent>
  </GridItem>
);

export default SectionTitle;
