import React, { useState } from 'react';
import { ExpandableSection } from '@patternfly/react-core';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import { ReviewSummaryContent } from '../../wizard/steps/review/ReviewSummary';
import { ClusterFeatureSupportLevelsDetailItem } from '../../featureSupportLevels';
import './ClusterSummaryExpandable.css';

type ClusterSummaryExpandableProps = {
  cluster: Cluster;
};

export const ClusterSummaryExpandable = ({ cluster }: ClusterSummaryExpandableProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <ExpandableSection
      toggleContent="Cluster summary"
      onToggle={() => setIsExpanded(!isExpanded)}
      isExpanded={isExpanded}
      className="cluster-summary-expandable"
      id="cluster-summary-expandable"
    >
      <div className="pf-v6-u-pl-md pf-v6-u-pt-md">
        <ClusterFeatureSupportLevelsDetailItem cluster={cluster} />
        <ReviewSummaryContent cluster={cluster} />
      </div>
    </ExpandableSection>
  );
};
