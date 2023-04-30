import { ExpandableSection } from '@patternfly/react-core';
import React, { useState } from 'react';
import { Cluster } from '../../../common';
import { ReviewSummaryContent } from '../clusterConfiguration/review/ReviewSummary';
import { ClusterFeatureSupportLevelsDetailItem } from '../featureSupportLevels';
import './ClusterSummaryExpandable.css';

type ClusterSummaryExpandableProps = {
  cluster: Cluster;
};

const ClusterSummaryExpandable = ({ cluster }: ClusterSummaryExpandableProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <ExpandableSection
      toggleContent="Cluster summary"
      onToggle={() => setIsExpanded(!isExpanded)}
      isExpanded={isExpanded}
      className="cluster-summary-expandable"
      id="cluster-summary-expandable"
    >
      <div className="pf-u-pl-md pf-u-pt-md">
        <ClusterFeatureSupportLevelsDetailItem cluster={cluster} />
        <ReviewSummaryContent cluster={cluster} />
      </div>
    </ExpandableSection>
  );
};

export default ClusterSummaryExpandable;
