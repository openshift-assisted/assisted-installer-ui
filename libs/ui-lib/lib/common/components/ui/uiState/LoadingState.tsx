import React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  Bullseye,
  EmptyStateVariant,
  Spinner,
  EmptyStateActions,
} from '@patternfly/react-core';

type Props = {
  content?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryActions?: React.ReactNode[];
};

const LoadingState: React.FC<Props> = ({ content, primaryAction, secondaryActions }) => (
  <Bullseye>
    <EmptyState variant={EmptyStateVariant.sm}>
      <Spinner size="xl" />
      {content && <EmptyStateBody>{content}</EmptyStateBody>}
      {primaryAction}
      {secondaryActions && <EmptyStateActions>{secondaryActions}</EmptyStateActions>}
    </EmptyState>
  </Bullseye>
);

export default LoadingState;
