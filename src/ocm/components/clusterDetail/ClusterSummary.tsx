import React from 'react';
import { Cluster } from '../../../common';
import ExpandableCard from '../ui/ExpandableCard';
import { ReviewSummaryContent } from '../clusterConfiguration/review/ReviewSummary';
import { ClusterFeatureSupportLevelsDetailItem } from '../featureSupportLevels';

type ClusterSummaryProps = {
  cluster: Cluster;
};

const ClusterSummary = ({ cluster }: ClusterSummaryProps) => {
  return (
    <ExpandableCard id="cluster-summary" title="Cluster summary" defaultIsExpanded={false}>
      <div className="pf-u-pl-md pf-u-pt-md">
        <ClusterFeatureSupportLevelsDetailItem cluster={cluster} />
        <ReviewSummaryContent cluster={cluster} />
      </div>
    </ExpandableCard>
  );
};

export default ClusterSummary;
