import React from 'react';
import {
  Title,
  EmptyState as PFEmptyState,
  EmptyStateBody,
  Bullseye,
  EmptyStateIcon,
  IconProps,
  EmptyStateSecondaryActions,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

type Props = {
  title?: string;
  content?: React.ReactNode;
  icon?: string | React.FC<IconProps>;
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
      <Title size="lg">{title}</Title>
      {content && <EmptyStateBody>{content}</EmptyStateBody>}
      {primaryAction}
      {secondaryActions && (
        <EmptyStateSecondaryActions>{secondaryActions}</EmptyStateSecondaryActions>
      )}
    </PFEmptyState>
  </Bullseye>
);

export default EmptyState;
