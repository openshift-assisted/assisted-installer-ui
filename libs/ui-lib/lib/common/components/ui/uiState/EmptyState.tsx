import React from 'react';
import {
  EmptyState as PFEmptyState,
  EmptyStateBody,
  Bullseye,
  EmptyStateActions,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';
import { ComponentType } from 'react';

type Props = {
  title?: string;
  content?: React.ReactNode;
  icon?: ComponentType;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode[];
};

const EmptyState: React.FC<Props> = ({
  title = 'No results found',
  content,
  icon = SearchIcon,
  primaryAction,
  secondaryActions,
}) => (
  <Bullseye>
    <PFEmptyState titleText={title} icon={icon} headingLevel="h2">
      {content && <EmptyStateBody>{content}</EmptyStateBody>}
      {primaryAction}
      {secondaryActions && <EmptyStateActions>{secondaryActions}</EmptyStateActions>}
    </PFEmptyState>
  </Bullseye>
);

export default EmptyState;
