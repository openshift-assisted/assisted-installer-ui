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
  OPERATOR_NAME_MCE,
} from '../../../../common';
import {
  ReviewClusterDetailTable,
  ReviewNetworkingTable,
  ReviewOperatorsTable,
  TableSummaryExpandable,
} from '.';
import { ReviewCustomManifestsTable } from './ReviewCustomManifestsTable';
import PlatformIntegrationNote from '../platformIntegration/PlatformIntegrationNote';
import useClusterCustomManifests from '../../../hooks/useClusterCustomManifests';

export const ReviewSummaryContent = ({ cluster }: { cluster: Cluster }) => {
  const showOperatorsSummary =
    hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_CNV) ||
    hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_ODF) ||
    hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_LVM) ||
    hasEnabledOperators(cluster.monitoredOperators, OPERATOR_NAME_MCE);
  const { customManifests } = useClusterCustomManifests(cluster.id, false);
  return (
    <>
      <TableSummaryExpandable title={'Cluster details'} id={'cluster-details-expandable'}>
        <ReviewClusterDetailTable cluster={cluster} />
      </TableSummaryExpandable>

      {showOperatorsSummary && (
        <TableSummaryExpandable title={'Operators'} id={'operators-expandable'}>
          <ReviewOperatorsTable cluster={cluster} />
        </TableSummaryExpandable>
      )}

      <TableSummaryExpandable title={'Host inventory'} id={'host-inventory-expandable'}>
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

      <TableSummaryExpandable title={'Networking'} id={'networking-expandable'}>
        <ReviewNetworkingTable cluster={cluster} />
      </TableSummaryExpandable>

      {customManifests && customManifests.length > 0 && (
        <TableSummaryExpandable title={'Custom manifests'} id={'custom-manifests-expandable'}>
          <ReviewCustomManifestsTable manifests={customManifests} />
        </TableSummaryExpandable>
      )}
    </>
  );
};

const ReviewSummary = ({ cluster }: { cluster: Cluster }) => {
  return (
    <ExpandableSection
      toggleText={'Cluster summary'}
      className={'summary-expandable'}
      isIndented
      isExpanded
    >
      <ReviewSummaryContent cluster={cluster} />
    </ExpandableSection>
  );
};

export default ReviewSummary;
