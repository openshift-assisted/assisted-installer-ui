import React from 'react';
import { ExpandableSection, Content } from '@patternfly/react-core';

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
      toggleContent={<Content className="pf-v6-u-font-weight-bold">{title}</Content>}
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
