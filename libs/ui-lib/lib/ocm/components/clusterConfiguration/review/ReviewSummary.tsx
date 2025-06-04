import React from 'react';
import { ExpandableSection } from '@patternfly/react-core';
import {
  DetailItem,
  DetailList,
  isClusterPlatformTypeVM,
  ReviewHostsInventory,
  SupportedPlatformType,
  RenderIf,
} from '../../../../common';
import {
  ReviewClusterDetailTable,
  ReviewNetworkingTable,
  ReviewOperatorsTable,
  ReviewPlatformTable,
  TableSummaryExpandable,
} from '.';
import { ReviewCustomManifestsTable } from './ReviewCustomManifestsTable';
import PlatformIntegrationNote from '../platformIntegration/PlatformIntegrationNote';
import useClusterCustomManifests from '../../../hooks/useClusterCustomManifests';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';

export const ReviewSummaryContent = ({ cluster }: { cluster: Cluster }) => {
  const { customManifests } = useClusterCustomManifests(cluster.id, false);
  return (
    <>
      <TableSummaryExpandable title={'Cluster details'} id={'cluster-details-expandable'}>
        <ReviewClusterDetailTable cluster={cluster} />
      </TableSummaryExpandable>

      <ReviewOperatorsTable cluster={cluster} />

      <TableSummaryExpandable title={'Host inventory'} id={'host-inventory-expandable'}>
        <>
          <ReviewHostsInventory hosts={cluster.hosts} />
          <RenderIf condition={isClusterPlatformTypeVM(cluster)}>
            <DetailList>
              <DetailItem
                title={'Platform integration'}
                value={
                  <>
                    <ReviewPlatformTable cluster={cluster} />
                    <PlatformIntegrationNote
                      platformType={cluster.platform?.type as SupportedPlatformType}
                    />
                  </>
                }
                testId="platform-integration-note"
                classNameValue={'pf-v6-u-mt-sm'}
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
