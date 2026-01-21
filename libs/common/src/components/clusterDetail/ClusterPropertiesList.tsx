import React from 'react';
import {
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Grid,
  GridItem,
} from '@patternfly/react-core';
import { DASH } from '../constants';

type ClusterPropertyItem = {
  key: string;
  value?: React.ReactNode;
};

const ListItem = ({ item }: { item: ClusterPropertyItem }) => (
  <DescriptionListGroup>
    <DescriptionListTerm>{item.key}</DescriptionListTerm>
    <DescriptionListDescription>{item.value || DASH}</DescriptionListDescription>
  </DescriptionListGroup>
);

type ClusterPropertiesListProps = {
  leftItems: ClusterPropertyItem[];
  rightItems?: ClusterPropertyItem[];
};

const ClusterPropertiesList = ({ leftItems, rightItems = [] }: ClusterPropertiesListProps) => {
  return (
    <Grid hasGutter>
      <GridItem span={rightItems.length ? 6 : 12}>
        <DescriptionList>
          {leftItems.map((item) => (
            <ListItem key={item.key} item={item} />
          ))}
        </DescriptionList>
      </GridItem>
      {rightItems.length && (
        <GridItem span={6}>
          <DescriptionList>
            {rightItems.map((item) => (
              <ListItem key={item.key} item={item} />
            ))}
          </DescriptionList>
        </GridItem>
      )}
    </Grid>
  );
};

export default ClusterPropertiesList;
