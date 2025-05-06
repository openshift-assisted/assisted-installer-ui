import React from 'react';
import {
  Title,
  EmptyState as PFEmptyState,
  EmptyStateBody,
  Bullseye,
  EmptyStateActions,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons/dist/js/icons/search-icon';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

type Props = {
  title?: string;
  content?: React.ReactNode;
  icon?: React.ComponentClass<SVGIconProps, any>;
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
    <PFEmptyState titleText={<Title headingLevel="h2">{title}</Title>} icon={icon}>
      {content && <EmptyStateBody>{content}</EmptyStateBody>}
      {primaryAction}
      {secondaryActions && <EmptyStateActions>{secondaryActions}</EmptyStateActions>}
    </PFEmptyState>
  </Bullseye>
);

export default EmptyState;
