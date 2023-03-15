import React, { ReactNode, useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardExpandableContent,
} from '@patternfly/react-core';

type ExpandableCardProps = {
  id: string;
  title: ReactNode;
  children: ReactNode;
  defaultIsExpanded?: boolean;
  className?: string;
};

const ExpandableCard = ({
  id,
  title,
  children,
  defaultIsExpanded = true,
  className = '',
}: ExpandableCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultIsExpanded);
  const cardId = `${id}-card`;
  return (
    <Card id={cardId} isExpanded={isExpanded} className={className} isPlain>
      <CardHeader
        onExpand={(_, id) => {
          if (id === cardId) {
            setIsExpanded(!isExpanded);
          }
        }}
        id={`${id}-header`}
        toggleButtonProps={{
          id: `toggle-${id}-button`,
          'aria-label': id,
          'aria-labelledby': `${id}-card-title toggle-${id}-button`,
          'aria-expanded': isExpanded,
        }}
        style={{ padding: 0 }}
      >
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardExpandableContent>
        <CardBody>{children}</CardBody>
      </CardExpandableContent>
    </Card>
  );
};

export default ExpandableCard;
