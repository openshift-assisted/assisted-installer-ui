import React from 'react';
import { ExpandableSection } from '@patternfly/react-core';

export const TableSummaryExpandable = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => {
  const [isExpanded, setExpanded] = React.useState(true);
  return (
    <ExpandableSection
      toggleContent={<b>{title}</b>}
      isExpanded={isExpanded}
      onToggle={() => setExpanded(!isExpanded)}
      isIndented
    >
      {children}
      <br />
    </ExpandableSection>
  );
};
