import React from 'react';
import {
  PageSectionVariants,
  Breadcrumb,
  BreadcrumbItem,
  PageSection,
} from '@patternfly/react-core';
import { Link } from 'react-router-dom-v5-compat';
import { isInOcm } from '../../../common/api';

const ClusterBreadcrumbs = ({ clusterName }: { clusterName?: string }) => (
  <PageSection variant={PageSectionVariants.light}>
    {(clusterName || isInOcm) && (
      <Breadcrumb>
        {isInOcm && (
          <BreadcrumbItem render={() => <Link to={'/cluster-list'}>Cluster List</Link>} />
        )}

        {clusterName ? (
          <BreadcrumbItem>
            <Link to={`..`}>Assisted Clusters</Link>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem isActive>Assisted Clusters</BreadcrumbItem>
        )}
        {clusterName && <BreadcrumbItem isActive>{clusterName}</BreadcrumbItem>}
      </Breadcrumb>
    )}
  </PageSection>
);

export default ClusterBreadcrumbs;
