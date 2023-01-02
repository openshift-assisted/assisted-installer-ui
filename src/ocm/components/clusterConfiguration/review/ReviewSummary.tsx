import React from 'react';
import { ExpandableSection } from '@patternfly/react-core';
import {
  Cluster,
  hasEnabledOperators,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_LVM,
  OPERATOR_NAME_ODF,
  ReviewHostsInventory,
} from '../../../../common';
import {
  ReviewClusterDetailTable,
  ReviewNetworkingTable,
  ReviewOperatorsTable,
  TableSummaryExpandable,
} from '.';

const ReviewSummary = ({ cluster }: { cluster: Cluster }) => {
  const showOperatorsSummary =
    hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_CNV) ||
    hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_ODF) ||
    hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_LVM);

  return (
    <ExpandableSection
      toggleText={'Cluster summary'}
      className={'summary-expandable'}
      isIndented
      isExpanded
    >
      <TableSummaryExpandable title={'Cluster details'}>
        <ReviewClusterDetailTable cluster={cluster} />
      </TableSummaryExpandable>

      {showOperatorsSummary && (
        <TableSummaryExpandable title={'Operators'}>
          <ReviewOperatorsTable cluster={cluster} />
        </TableSummaryExpandable>
      )}

      <TableSummaryExpandable title={'Inventory'}>
        <ReviewHostsInventory hosts={cluster.hosts} />
      </TableSummaryExpandable>

      <TableSummaryExpandable title={'Networking'}>
        <ReviewNetworkingTable cluster={cluster} />
      </TableSummaryExpandable>
    </ExpandableSection>
  );
};

export default ReviewSummary;
