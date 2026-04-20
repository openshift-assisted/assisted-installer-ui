import React from 'react';
import { Breadcrumb, BreadcrumbItem, PageSection } from '@patternfly/react-core';
import { Link } from 'react-router-dom-v5-compat';
import { isInOcm } from '../../../common/api';

const ClusterBreadcrumbs = ({ clusterName }: { clusterName?: string }) => {
  return (
    !isInOcm && (
      <PageSection hasBodyWrapper={false}>
        <Breadcrumb data-testid="cluster-breadcrumbs">
          <BreadcrumbItem data-testid="assisted-clusters-breadcrumb">
            <Link to={`..`}>Assisted Clusters</Link>
          </BreadcrumbItem>
          {clusterName && (
            <BreadcrumbItem data-testid="cluster-breadcrumb" isActive>
              {clusterName}
            </BreadcrumbItem>
          )}
        </Breadcrumb>
      </PageSection>
    )
  );
};

export default ClusterBreadcrumbs;
