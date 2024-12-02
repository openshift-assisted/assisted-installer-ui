import React from 'react';
import {
  Title,
  EmptyState as PFEmptyState,
  EmptyStateBody,
  Bullseye,
  EmptyStateIcon,
  EmptyStateIconProps,
  EmptyStateActions,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';

type Props = {
  title?: string;
  content?: React.ReactNode;
  icon?: EmptyStateIconProps['icon'];
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
    <PFEmptyState>
      <EmptyStateIcon icon={icon} />
      <Title headingLevel="h2">{title}</Title>
      {content && <EmptyStateBody>{content}</EmptyStateBody>}
      {primaryAction}
      {secondaryActions && <EmptyStateActions>{secondaryActions}</EmptyStateActions>}
    </PFEmptyState>
  </Bullseye>
);

export default EmptyState;
