import React from 'react';
import { ExpandableSection } from '@patternfly/react-core';
import {
  Cluster,
  DetailItem,
  DetailList,
  hasEnabledOperators,
  isClusterPlatformTypeVM,
  OPERATOR_NAME_CNV,
  OPERATOR_NAME_LVM,
  OPERATOR_NAME_ODF,
  ReviewHostsInventory,
  SupportedPlatformType,
  RenderIf,
} from '../../../../common';
import {
  ReviewClusterDetailTable,
  ReviewNetworkingTable,
  ReviewOperatorsTable,
  TableSummaryExpandable,
} from '.';
import PlatformIntegrationNote from '../platformIntegration/PlatformIntegrationNote';

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

      <TableSummaryExpandable title={'Host inventory'}>
        <>
          <ReviewHostsInventory hosts={cluster.hosts} />
          <RenderIf condition={isClusterPlatformTypeVM(cluster)}>
            <DetailList>
              <DetailItem
                title={'Platform integration'}
                value={
                  <PlatformIntegrationNote
                    platformType={cluster.platform?.type as SupportedPlatformType}
                  />
                }
                testId="platform-integration-note"
                classNameValue={'pf-u-mt-sm'}
              />
            </DetailList>
          </RenderIf>
        </>
      </TableSummaryExpandable>

      <TableSummaryExpandable title={'Networking'}>
        <ReviewNetworkingTable cluster={cluster} />
      </TableSummaryExpandable>
    </ExpandableSection>
  );
};

export default ReviewSummary;
