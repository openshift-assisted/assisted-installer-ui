import React from 'react';
import { ExpandableSection } from '@patternfly/react-core';

export const TableSummaryExpandable = ({
  title,
  children,
  id,
}: {
  title: string;
  children?: React.ReactNode;
  id?: string;
}) => {
  const [isExpanded, setExpanded] = React.useState(true);
  return (
    <ExpandableSection
      toggleContent={<b>{title}</b>}
      isExpanded={isExpanded}
      onToggle={() => setExpanded(!isExpanded)}
      isIndented
      id={id ? id : title}
    >
      {children}
      <br />
    </ExpandableSection>
  );
};
