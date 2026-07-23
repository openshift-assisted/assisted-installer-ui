import React from 'react';
import { ExpandableSection } from '@patternfly/react-core';
import { Cluster } from '@openshift-assisted/types/assisted-installer-service';
import {
  DetailItem,
  DetailList,
  isClusterPlatformTypeVM,
  ReviewHostsInventory,
  SupportedPlatformType,
  RenderIf,
} from '../../../../../common';
import { useClusterCustomManifests } from '../../../../hooks';
import { PlatformIntegrationNote } from '../../wizardFields';
import { userProvidedManifests } from '../customManifests/components/utils';
import { TableSummaryExpandable } from './components/TableSummaryExpandable';
import {
  ReviewClusterDetailTable,
  ReviewNetworkingTable,
  ReviewOperatorsTable,
  ReviewPlatformTable,
  ReviewCustomManifestsTable,
} from './components';

export const ReviewSummaryContent = ({ cluster }: { cluster: Cluster }) => {
  const { customManifests } = useClusterCustomManifests(cluster.id, false);
  const manifestsForReview = userProvidedManifests(customManifests);
  const showCustomManifests = manifestsForReview.length > 0;

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

      {showCustomManifests && (
        <TableSummaryExpandable title={'Custom manifests'} id={'custom-manifests-expandable'}>
          <ReviewCustomManifestsTable manifests={manifestsForReview} />
        </TableSummaryExpandable>
      )}
    </>
  );
};

export const ReviewSummary = ({ cluster }: { cluster: Cluster }) => {
  return (
    <ExpandableSection
      toggleContent={'Cluster summary'}
      id={'summary-expandable'}
      isExpanded={true}
      isIndented
    >
      <ReviewSummaryContent cluster={cluster} />
    </ExpandableSection>
  );
};
